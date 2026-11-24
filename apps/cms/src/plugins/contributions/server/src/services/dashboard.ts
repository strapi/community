import type { Core } from "@strapi/strapi";
import { errors } from "@strapi/utils";
import { ISSUES_TO_PICK_UP } from "../constants";
import {
  CONTRIBUTION_POINTS,
  CONTRIBUTIONS_SINCE,
  CONTRIBUTOR_TIERS,
  type ContributionStats,
} from "../utils/contributor-tiers";
import { fetchOpenIssues, type OpenIssue } from "../utils/github";
import { findGithubAccountId } from "../utils/github-account";

/** How often a user may refresh their own score from the dashboard. */
const REFRESH_COOLDOWN_MS = 15 * 60 * 1000;

/** How long the "issues to pick up" list is cached (shared by everyone). */
const ISSUES_CACHE_MS = 60 * 60 * 1000;
const ISSUES_LIMIT = 8;

/**
 * Whether the user earns points at all: not when they've hidden their
 * GitHub contributions. (Strapi employees don't get a dashboard at all —
 * see `isEligible`.) GitHub being linked is reported separately: without
 * it, Community Hub submissions still earn points.
 */
type DashboardStatus = "active" | "hidden";

let issuesCache: {
  at: number;
  issues: (OpenIssue & { kind: string })[];
} | null = null;

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Whether the user has a contributions dashboard at all: everyone but
   * current and former Strapi employees, who don't take part in tiers
   * (see the `employees` service).
   */
  async isEligible({ userId }: { userId: string | number }) {
    const employee = await strapi
      .plugin("contributions")
      .service("employees")
      .getStatus(userId);
    return !employee;
  },

  /**
   * Everything the personal contributions dashboard shows for a user:
   * why they do or don't earn a tier, their stored score/tier and its
   * breakdown (see the `tiers` service's `syncUser`), and every tier with
   * its benefits (`plugin::contributions.tier-benefit`, edited in the
   * admin) — the tier ladder comes from here rather than the web app's
   * mirror, so thresholds and benefits can't disagree.
   */
  async getForUser({ userId }: { userId: string | number }) {
    if (!(await this.isEligible({ userId }))) {
      throw new errors.ForbiddenError(
        "Strapi employees don't take part in contributor tiers.",
      );
    }

    const [user] = await strapi.documents("plugin::better-auth.user").findMany({
      filters: { id: userId },
      fields: ["contributor_tier", "contribution_score", "contribution_stats"],
      populate: { profile: { fields: ["show_github_contributions"] } },
    });

    if (!user) throw new errors.NotFoundError("User not found.");

    const githubLinked = Boolean(await findGithubAccountId(userId));

    const status: DashboardStatus =
      user.profile?.show_github_contributions === false ? "hidden" : "active";

    const benefits = await strapi
      .documents("plugin::contributions.tier-benefit")
      .findMany({
        fields: ["tier", "title", "description", "sort"],
        sort: [{ sort: "asc" }, { id: "asc" }],
        pagination: { pageSize: 100 },
      });

    const stats = (user.contribution_stats ?? null) as ContributionStats | null;

    return {
      status,
      githubLinked,
      tier: user.contributor_tier ?? null,
      score: user.contribution_score ?? 0,
      stats,
      refreshAvailableAt:
        status === "active"
          ? (refreshAvailableAt(stats)?.toISOString() ?? null)
          : null,
      points: CONTRIBUTION_POINTS,
      since: CONTRIBUTIONS_SINCE,
      tiers: CONTRIBUTOR_TIERS.map((tier) => ({
        ...tier,
        benefits: benefits
          .filter((benefit) => benefit.tier === tier.key)
          .map(({ title, description }) => ({ title, description })),
      })),
    };
  },

  /**
   * Re-syncs the user's score now, from the dashboard's "Refresh" button —
   * at most once per `REFRESH_COOLDOWN_MS` (it calls GitHub), and only
   * for users who earn a tier at all.
   */
  async refreshForUser({ userId }: { userId: string | number }) {
    const current = await this.getForUser({ userId });

    if (current.status !== "active") {
      throw new errors.ForbiddenError(
        "Your contributions aren't counted for a tier.",
      );
    }

    const availableAt = current.refreshAvailableAt
      ? new Date(current.refreshAvailableAt)
      : null;
    if (availableAt && availableAt.getTime() > Date.now()) {
      const minutes = Math.ceil((availableAt.getTime() - Date.now()) / 60000);
      throw new errors.RateLimitError(
        `You can refresh again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      );
    }

    await strapi.plugin("contributions").service("tiers").syncUser({ userId });

    return this.getForUser({ userId });
  },

  /**
   * Issues to suggest on the dashboard (see `ISSUES_TO_PICK_UP`) — the
   * same for everyone, so cached in memory for `ISSUES_CACHE_MS`. A
   * GitHub failure falls back to the stale list, or throws without one.
   */
  async getIssuesToPickUp() {
    if (issuesCache && Date.now() - issuesCache.at < ISSUES_CACHE_MS) {
      return issuesCache.issues;
    }

    try {
      const issues: (OpenIssue & { kind: string })[] = [];

      for (const { kind, query } of ISSUES_TO_PICK_UP) {
        if (issues.length >= ISSUES_LIMIT) break;

        const found = await fetchOpenIssues(query, ISSUES_LIMIT);
        for (const issue of found) {
          if (issues.length >= ISSUES_LIMIT) break;
          if (issues.some((existing) => existing.url === issue.url)) continue;
          issues.push({ ...issue, kind });
        }
      }

      issuesCache = { at: Date.now(), issues };
      return issues;
    } catch (error) {
      if (issuesCache) {
        strapi.log.warn(
          `[contributions] Issues to pick up: serving stale list — ${error}`,
        );
        return issuesCache.issues;
      }
      throw error;
    }
  },
});

function refreshAvailableAt(stats: ContributionStats | null): Date | null {
  if (!stats?.syncedAt) return null;
  return new Date(new Date(stats.syncedAt).getTime() + REFRESH_COOLDOWN_MS);
}

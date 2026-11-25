import type { Core } from "@strapi/strapi";
import {
  type ContributionStats,
  computeContributionScore,
  getContributorTier,
  NO_GITHUB_CONTRIBUTIONS,
} from "../utils/contributor-tiers";
import { fetchGithubContributionCounts } from "../utils/github";
import { findGithubAccountId } from "../utils/github-account";
import {
  countPublishedSubmissions,
  findSubmissionOwnerIds,
} from "../utils/submissions";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Recomputes one user's `contribution_score` and `contributor_tier` (see
   * utils/contributor-tiers.ts) from their GitHub contribution counts (when
   * GitHub is linked) and their published Community Hub submissions.
   * Both are cleared when the user has nothing that counts, has
   * turned off `show_github_contributions` (a tier would otherwise
   * advertise contributions the user chose to hide), or is a current or
   * former Strapi employee (see the `employees` service — tiers recognize
   * community contributors, and work done as an employee would crowd them
   * out). Also stores the breakdown behind the score, with when it was
   * checked, as `contribution_stats` (`null` when nothing is counted) —
   * for the personal contributions dashboard. Throws if GitHub can't be
   * reached, leaving everything stored untouched.
   */
  async syncUser({ userId }: { userId: string | number }) {
    const [user] = await strapi.documents("plugin::better-auth.user").findMany({
      filters: { id: userId },
      fields: [
        "documentId",
        "contributor_tier",
        "contribution_score",
        "contribution_stats",
      ],
      populate: { profile: { fields: ["show_github_contributions"] } },
    });

    if (!user) return null;

    let score = 0;
    let stats: ContributionStats | null = null;

    const employee = await strapi
      .plugin("contributions")
      .service("employees")
      .getStatus(userId);

    if (user.profile?.show_github_contributions !== false && !employee) {
      // GitHub only when linked; published Community Hub submissions
      // count either way.
      const githubUserId = await findGithubAccountId(userId);
      const [github, hub] = await Promise.all([
        githubUserId ? fetchGithubContributionCounts(githubUserId) : null,
        countPublishedSubmissions(strapi, userId),
      ]);

      const counts = { ...NO_GITHUB_CONTRIBUTIONS, ...github, ...hub };

      // Nothing to show without GitHub or a counted submission.
      if (github || hub.publishedPlugins || hub.publishedTemplates) {
        score = computeContributionScore(counts);
        stats = { ...counts, syncedAt: new Date().toISOString() };
      }
    }

    const tier = getContributorTier(score);

    // Written even when only `syncedAt` moved, so the dashboard's "last
    // updated" is truthful. Skipped when there's nothing at all to store,
    // so the nightly job doesn't rewrite (and reindex) unchanged users
    // without a score.
    if (
      stats ||
      user.contribution_stats ||
      tier !== (user.contributor_tier ?? null) ||
      score !== (user.contribution_score ?? 0)
    ) {
      await strapi.documents("plugin::better-auth.user").update({
        documentId: user.documentId,
        data: {
          contributor_tier: tier,
          contribution_score: score,
          contribution_stats: stats,
        },
      });

      if (tier !== (user.contributor_tier ?? null)) {
        strapi.plugin("contributions").service("discord").notify(userId);
      }
    }

    return { tier, score, stats };
  },

  /**
   * The daily contributor tier job (registered in the plugin's
   * `bootstrap`): syncs every user with a linked GitHub account or a
   * counted Community Hub submission, plus anyone still holding a tier
   * (so unlinking GitHub, or an unpublished submission, clears it).
   * Sequential, with a pause between users, to stay clear of GitHub's
   * secondary rate limits on search.
   */
  async syncAll() {
    if (!process.env.GITHUB_ACCESS_TOKEN) {
      strapi.log.warn(
        "[contributions] GITHUB_ACCESS_TOKEN is not set — skipping tier sync.",
      );
      return { synced: 0, failed: 0 };
    }

    const [accounts, tieredUsers, submissionOwners] = await Promise.all([
      strapi.db.query("plugin::better-auth.account").findMany({
        where: { providerId: "github" },
        select: ["userId"],
      }),
      strapi.db.query("plugin::better-auth.user").findMany({
        where: { contributor_tier: { $notNull: true } },
        select: ["id"],
      }),
      findSubmissionOwnerIds(strapi),
    ]);

    const userIds = new Set<string>([
      ...accounts.map((account) => String(account.userId)),
      ...tieredUsers.map((user) => String(user.id)),
      ...submissionOwners,
    ]);

    let synced = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        await this.syncUser({ userId });
        synced++;
      } catch (error) {
        failed++;
        strapi.log.warn(
          `[contributions] Failed to sync tier of user ${userId}: ${error}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return { synced, failed };
  },
});

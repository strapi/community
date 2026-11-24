import type { Core } from "@strapi/strapi";
import {
  computeContributionScore,
  getContributorTier,
} from "../utils/contributor-tiers";
import { fetchGithubContributionCounts } from "../utils/github";
import { findGithubAccountId } from "../utils/github-account";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Recomputes one user's `contribution_score` and `contributor_tier` (see
   * utils/contributor-tiers.ts) from their GitHub contribution counts.
   * Both are cleared when the user has no linked GitHub account, has
   * turned off `show_github_contributions` (a tier would otherwise
   * advertise contributions the user chose to hide), or is a current or
   * former Strapi employee (see `syncStrapiEmployees` — tiers recognize
   * community contributors, and work done as an employee would crowd them
   * out). Only writes when something changed, since every write reindexes
   * the user in Meilisearch. Throws if GitHub can't be reached, leaving the
   * stored tier untouched.
   */
  async syncUser({ userId }: { userId: string | number }) {
    const [user] = await strapi.documents("plugin::better-auth.user").findMany({
      filters: { id: userId },
      fields: [
        "documentId",
        "contributor_tier",
        "contribution_score",
        "strapi_employee",
        "former_strapi_employee",
      ],
      populate: { profile: { fields: ["show_github_contributions"] } },
    });

    if (!user) return null;

    let score = 0;

    if (
      user.profile?.show_github_contributions !== false &&
      !user.strapi_employee &&
      !user.former_strapi_employee
    ) {
      const githubUserId = await findGithubAccountId(userId);
      const counts = githubUserId
        ? await fetchGithubContributionCounts(githubUserId)
        : null;

      if (counts) score = computeContributionScore(counts);
    }

    const tier = getContributorTier(score);

    if (
      tier !== (user.contributor_tier ?? null) ||
      score !== (user.contribution_score ?? 0)
    ) {
      await strapi.documents("plugin::better-auth.user").update({
        documentId: user.documentId,
        data: { contributor_tier: tier, contribution_score: score },
      });
    }

    return { tier, score };
  },

  /**
   * Keeps the `strapi_employee` flag in line with membership (any role) of
   * the Strapi team's own organization, `IMPERSONATION_ORGANIZATION_ID`
   * (its numeric `id`), and marks anyone who's no longer a member as
   * `former_strapi_employee` — so leaving Strapi never turns years of work
   * as an employee into a contributor tier. `former_strapi_employee` is
   * never unset here: admins set it by hand (in the better-auth dashboard)
   * for people who left before this existed. Database-only, so it runs at
   * bootstrap and before every tier sync. A no-op when the env var is
   * unset — an unconfigured environment shouldn't demote everyone.
   */
  async syncStrapiEmployees() {
    const organizationId = Number(process.env.IMPERSONATION_ORGANIZATION_ID);
    if (!Number.isInteger(organizationId) || organizationId <= 0) {
      return { joined: 0, left: 0 };
    }

    const [members, flagged] = await Promise.all([
      strapi.db.query("plugin::better-auth.member").findMany({
        where: { organizationId },
        select: ["userId"],
        limit: 10000,
      }),
      strapi.db.query("plugin::better-auth.user").findMany({
        where: { strapi_employee: true },
        select: ["id"],
        limit: 10000,
      }),
    ]);

    const memberIds = new Set(members.map((member) => String(member.userId)));
    const flaggedIds = new Set(flagged.map((user) => String(user.id)));

    const joined = [...memberIds].filter((id) => !flaggedIds.has(id));
    const left = [...flaggedIds].filter((id) => !memberIds.has(id));

    const update = async (
      id: string,
      data: { strapi_employee: boolean; former_strapi_employee?: boolean },
    ) => {
      const [user] = await strapi
        .documents("plugin::better-auth.user")
        .findMany({ filters: { id }, fields: ["documentId"] });
      if (!user) return;
      // Clear any tier in the same write; the tier sync would otherwise
      // only catch up at its next run.
      await strapi.documents("plugin::better-auth.user").update({
        documentId: user.documentId,
        data: { ...data, contributor_tier: null, contribution_score: 0 },
      });
    };

    for (const id of joined) await update(id, { strapi_employee: true });
    for (const id of left) {
      await update(id, {
        strapi_employee: false,
        former_strapi_employee: true,
      });
    }

    return { joined: joined.length, left: left.length };
  },

  /**
   * The daily contributor tier job (registered in the plugin's
   * `bootstrap`): syncs every user with a linked GitHub account, plus
   * anyone still holding a tier (so unlinking GitHub clears it).
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

    await this.syncStrapiEmployees();

    const [accounts, tieredUsers] = await Promise.all([
      strapi.db.query("plugin::better-auth.account").findMany({
        where: { providerId: "github" },
        select: ["userId"],
      }),
      strapi.db.query("plugin::better-auth.user").findMany({
        where: { contributor_tier: { $notNull: true } },
        select: ["id"],
      }),
    ]);

    const userIds = new Set<string>([
      ...accounts.map((account) => String(account.userId)),
      ...tieredUsers.map((user) => String(user.id)),
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

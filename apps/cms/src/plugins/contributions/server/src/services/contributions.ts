import type { Core } from "@strapi/strapi";
import { fetchGithubContributions } from "../utils/github";
import { findGithubAccountId } from "../utils/github-account";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * The user's issues/PRs/discussions in `strapi/strapi` and the
   * `strapi-community` organization, for the public profile's "GitHub
   * Contributions" tab. `null` when the user has no linked GitHub account,
   * or has turned the tab off (`show_github_contributions` — on unless
   * explicitly `false`, so users without a profile yet are included).
   * Throws if GitHub can't be reached.
   */
  async getForUser({ userId }: { userId: string | number }) {
    const [user] = await strapi.documents("plugin::better-auth.user").findMany({
      filters: { id: userId },
      fields: ["documentId"],
      populate: { profile: { fields: ["show_github_contributions"] } },
    });

    if (!user || user.profile?.show_github_contributions === false) {
      return null;
    }

    const githubUserId = await findGithubAccountId(userId);
    if (!githubUserId) return null;

    return fetchGithubContributions(githubUserId);
  },
});

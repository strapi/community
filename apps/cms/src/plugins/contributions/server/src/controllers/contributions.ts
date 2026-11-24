import type { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * GET /api/contributions/users/:id — used by the public user page's
   * "GitHub Contributions" tab. `data` is `null` when there's nothing to
   * show (see the `contributions` service's `getForUser`). A GitHub
   * failure responds 502 rather than `null`: the web app caches only 200
   * responses, so a temporary failure isn't cached as "nothing to show".
   */
  async findForUser(ctx) {
    const { id } = ctx.params;

    try {
      const contributions = await strapi
        .plugin("contributions")
        .service("contributions")
        .getForUser({ userId: id });

      ctx.body = { data: contributions };
    } catch (error) {
      strapi.log.warn(`[contributions] GitHub fetch failed: ${error}`);
      ctx.status = 502;
      ctx.body = { error: "Failed to load GitHub contributions." };
    }
  },
});

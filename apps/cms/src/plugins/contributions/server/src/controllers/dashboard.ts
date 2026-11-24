import type { Core } from "@strapi/strapi";

/** The better-auth user id, stashed by the `is-authenticated` policy. */
const sessionUserId = (ctx) => ctx.state.betterAuthSession.user.id;

export default ({ strapi }: { strapi: Core.Strapi }) => {
  const dashboard = () => strapi.plugin("contributions").service("dashboard");

  return {
    /**
     * GET /api/contributions/me/eligibility — whether the user has a
     * contributions dashboard (not for Strapi employees), so the account
     * settings can leave out its tab.
     */
    async eligibility(ctx) {
      ctx.body = {
        data: {
          eligible: await dashboard().isEligible({
            userId: sessionUserId(ctx),
          }),
        },
      };
    },

    /** GET /api/contributions/me — the personal contributions dashboard. */
    async me(ctx) {
      ctx.body = {
        data: await dashboard().getForUser({ userId: sessionUserId(ctx) }),
      };
    },

    /**
     * POST /api/contributions/me/refresh — re-syncs the user's score now
     * (rate-limited; see the `dashboard` service's `refreshForUser`).
     */
    async refreshMe(ctx) {
      ctx.body = {
        data: await dashboard().refreshForUser({ userId: sessionUserId(ctx) }),
      };
    },

    /**
     * GET /api/contributions/issues — issues to pick up, for the dashboard.
     * Public data, cached server-side (see `getIssuesToPickUp`).
     */
    async issues(ctx) {
      try {
        ctx.body = { data: await dashboard().getIssuesToPickUp() };
      } catch (error) {
        strapi.log.warn(`[contributions] Issues to pick up failed: ${error}`);
        ctx.status = 502;
        ctx.body = { error: "Failed to load issues." };
      }
    },
  };
};

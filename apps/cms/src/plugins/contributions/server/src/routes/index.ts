/**
 * Called directly from the browser with a better-auth session cookie, not
 * a Strapi API token — see the better-auth extension's
 * `is-authenticated` policy (and why it needs `auth: false`).
 */
const sessionAuth = {
  auth: false as const,
  policies: ["plugin::better-auth.is-authenticated"],
};

export default {
  "content-api": {
    type: "content-api" as const,
    routes: [
      {
        method: "GET",
        path: "/users/:id",
        handler: "contributions.findForUser",
        // Any valid API token (the web app's server-side bearer token);
        // not public, since every uncached call hits GitHub.
        config: { auth: { scope: [] }, policies: [] },
      },
      {
        method: "GET",
        path: "/me",
        handler: "dashboard.me",
        config: sessionAuth,
      },
      {
        method: "GET",
        path: "/me/eligibility",
        handler: "dashboard.eligibility",
        config: sessionAuth,
      },
      {
        method: "POST",
        path: "/me/refresh",
        handler: "dashboard.refreshMe",
        config: sessionAuth,
      },
      {
        method: "GET",
        path: "/discord-roles",
        handler: "dashboard.discordRoles",
        // Any valid API token — n8n's "Strapi API" credential.
        config: { auth: { scope: [] }, policies: [] },
      },
      {
        method: "GET",
        path: "/issues",
        handler: "dashboard.issues",
        // Public: the same open GitHub issues for everyone, and cached in
        // memory, so GitHub is hit at most once an hour however often
        // it's called.
        config: { auth: false as const, policies: [] },
      },
    ],
  },
};

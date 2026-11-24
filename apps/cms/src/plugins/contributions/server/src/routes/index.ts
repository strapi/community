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
    ],
  },
};

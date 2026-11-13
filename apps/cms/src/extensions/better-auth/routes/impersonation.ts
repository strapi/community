export default {
  "content-api": {
    type: "content-api",
    routes: [
      {
        method: "GET",
        path: "/impersonation/allowed",
        handler: "impersonation.allowed",
        config: {
          // Called directly from the browser with a better-auth session
          // cookie, not a Strapi API token, so skip the default
          // content-api-token check in favor of our session-based policy.
          auth: false,
          policies: ["plugin::better-auth.is-authenticated"],
          middlewares: [],
          prefix: "",
        },
      },
    ],
  },
};

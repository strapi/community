export default {
  "content-api": {
    type: "content-api",
    routes: [
      {
        method: "GET",
        path: "/users",
        handler: "user.find",
        config: {
          policies: [],
          prefix: "",
        },
      },
      {
        method: "GET",
        path: "/users/:id",
        handler: "user.findOne",
        config: {
          policies: [],
          prefix: "",
        },
      },
      {
        method: "GET",
        path: "/users/:id/related-content",
        handler: "user.relatedContent",
        config: { policies: [], middlewares: [], prefix: "" },
      },
      {
        method: "GET",
        path: "/users/me/profile",
        handler: "user.getProfile",
        config: {
          // Called directly from the browser with a better-auth session
          // cookie, not a Strapi API token, so the default
          // content-api-token check must be skipped in favor of our own
          // session-based policy.
          auth: false,
          policies: ["plugin::better-auth.is-authenticated"],
          middlewares: [],
          prefix: "",
        },
      },
      {
        method: "PUT",
        path: "/users/me/profile",
        handler: "user.updateProfile",
        config: {
          auth: false,
          policies: ["plugin::better-auth.is-authenticated"],
          middlewares: [],
          prefix: "",
        },
      },
      {
        method: "POST",
        path: "/users/me/avatar",
        handler: "user.uploadAvatar",
        config: {
          // These are called directly from the browser with a better-auth
          // session cookie, not a Strapi API token, so the default
          // content-api-token check must be skipped in favor of our own
          // session-based policy.
          auth: false,
          policies: ["plugin::better-auth.is-authenticated"],
          middlewares: [],
          prefix: "",
        },
      },
      {
        method: "DELETE",
        path: "/users/me/avatar",
        handler: "user.deleteAvatar",
        config: {
          auth: false,
          policies: ["plugin::better-auth.is-authenticated"],
          middlewares: [],
          prefix: "",
        },
      },
    ],
  },
};

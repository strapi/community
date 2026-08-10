export default {
  "content-api": {
    type: "content-api",
    routes: [
      {
        method: "GET",
        path: "/organizations",
        handler: "organization.find",
        config: {
          policies: [],
          prefix: "",
        },
      },
      {
        method: "GET",
        path: "/organizations/:id",
        handler: "organization.findOne",
        config: {
          policies: [],
          prefix: "",
        },
      },
      {
        method: "GET",
        path: "/organizations/:id/related-content",
        handler: "organization.relatedContent",
        config: { policies: [], middlewares: [], prefix: "" },
      },
      {
        method: "GET",
        path: "/organizations/:id/members",
        handler: "organization.members",
        config: { policies: [], middlewares: [], prefix: "" },
      },
      {
        method: "PUT",
        path: "/organizations/:id/profile",
        handler: "organization.updateProfile",
        config: {
          // Called directly from the browser with a better-auth session
          // cookie, not a Strapi API token, so the default
          // content-api-token check must be skipped in favor of our own
          // session- and role-based policies.
          auth: false,
          policies: [
            "plugin::better-auth.is-authenticated",
            "plugin::better-auth.is-organization-owner",
          ],
          middlewares: [],
          prefix: "",
        },
      },
      {
        method: "POST",
        path: "/organizations/logo",
        handler: "organization.uploadLogo",
        config: {
          auth: false,
          policies: ["plugin::better-auth.is-authenticated"],
          middlewares: [],
          prefix: "",
        },
      },
      {
        method: "DELETE",
        path: "/organizations/logo",
        handler: "organization.deleteLogo",
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

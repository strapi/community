/**
 * package router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::package.package", {
  config: {
    update: {
      // Reused by the web app's "Submissions" edit form, called directly
      // from the browser with a better-auth session cookie rather than a
      // Strapi API token — same reasoning as `organization.updateProfile`
      // (apps/cms/src/extensions/better-auth/routes/organization.ts).
      auth: false,
      policies: [
        "plugin::better-auth.is-authenticated",
        {
          name: "plugin::better-auth.is-content-owner",
          config: { uid: "api::package.package" },
        },
      ],
    },
  },
});

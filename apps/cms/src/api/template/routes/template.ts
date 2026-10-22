/**
 * template router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::template.template", {
  config: {
    update: {
      // Reused by the web app's "Submissions" edit form — see the same
      // config on `api::package.package`'s router for the full reasoning.
      auth: false,
      policies: [
        "plugin::better-auth.is-authenticated",
        {
          name: "plugin::better-auth.is-content-owner",
          config: { uid: "api::template.template" },
        },
      ],
    },
  },
});

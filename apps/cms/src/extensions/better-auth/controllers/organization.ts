/**
 * organization controller
 */

import { factories } from "@strapi/strapi";
import { getPluginService } from "../utils";

export default factories.createCoreController(
  "plugin::better-auth.organization",
  () => ({
    async relatedContent(ctx) {
      const { id } = ctx.params;

      const service = getPluginService("organization");

      const [packages, templates] = await Promise.all([
        service.getRelatedContent({
          organizationId: id,
          uid: "api::package.package",
          query: ctx.query,
        }),
        service.getRelatedContent({
          organizationId: id,
          uid: "api::template.template",
          query: ctx.query,
        }),
      ]);

      ctx.body = { packages, templates };
    },
  }),
);

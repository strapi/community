/**
 * organization controller
 */

import { factories } from "@strapi/strapi";
import { getPluginService, organizationProfileFields } from "../utils";

const MAX_LOGO_SIZE = 2 * 1024 * 1024;

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
    async members(ctx) {
      const { id } = ctx.params;

      const service = getPluginService("organization");

      const members = await service.getMembers({
        organizationId: id,
        query: ctx.query,
      });

      ctx.body = members;
    },

    /**
     * PUT /organizations/:id/profile — used by the web app's organization
     * "Profile" tab. Gated by the `is-authenticated` and
     * `is-organization-owner` policies.
     */
    async updateProfile(ctx) {
      const { id } = ctx.params;
      const body = ctx.request.body ?? {};

      const data = Object.fromEntries(
        organizationProfileFields
          .filter((field) => field in body)
          .map((field) => [field, body[field]]),
      );

      const service = getPluginService("organization");

      const profile = await service.updateProfile({
        organizationId: id,
        data,
      });

      ctx.body = profile;
    },

    /**
     * POST /organizations/logo — used by better-auth-ui's
     * `organization.logo.upload` config. Gated by the `is-authenticated`
     * policy; not organization-scoped, since better-auth-ui doesn't tell
     * us which org the logo is for until the follow-up
     * `organization.update` call (which better-auth itself already
     * restricts to owners/admins of that org).
     */
    async uploadLogo(ctx) {
      const session = ctx.state.betterAuthSession;

      const uploaded = ctx.request.files?.file;
      const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;
      if (!file) return ctx.badRequest("No file provided.");
      if (!file.mimetype?.startsWith("image/")) {
        return ctx.badRequest("Logo must be an image.");
      }
      if (file.size > MAX_LOGO_SIZE) {
        return ctx.badRequest("Logo must be smaller than 2 MB.");
      }

      const uploadedFile = await getPluginService("organization").uploadLogo({
        userId: session.user.id,
        file,
      });

      ctx.body = { url: uploadedFile.url };
    },

    /**
     * DELETE /organizations/logo — used by better-auth-ui's
     * `organization.logo.delete` config.
     */
    async deleteLogo(ctx) {
      const session = ctx.state.betterAuthSession;

      const { url } = ctx.request.body ?? {};
      if (!url) return ctx.badRequest("Missing url.");

      const deleted = await getPluginService("organization").deleteLogo({
        userId: session.user.id,
        url,
      });
      if (!deleted) return ctx.notFound();

      ctx.body = { success: true };
    },
  }),
);

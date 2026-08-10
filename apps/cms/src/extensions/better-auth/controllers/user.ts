/**
 * user controller
 */

import { factories } from "@strapi/strapi";
import { getPluginService } from "../utils";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export default factories.createCoreController(
  "plugin::better-auth.user",
  () => ({
    async relatedContent(ctx) {
      const { id } = ctx.params;

      const service = getPluginService("user");

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

    /**
     * POST /users/me/avatar — used by better-auth-ui's `avatar.upload`
     * config. Gated by the `is-authenticated` policy, which populates
     * `ctx.state.betterAuthSession`.
     */
    async uploadAvatar(ctx) {
      const session = ctx.state.betterAuthSession;

      const uploaded = ctx.request.files?.file;
      const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;
      if (!file) return ctx.badRequest("No file provided.");
      if (!file.mimetype?.startsWith("image/")) {
        return ctx.badRequest("Avatar must be an image.");
      }
      if (file.size > MAX_AVATAR_SIZE) {
        return ctx.badRequest("Avatar must be smaller than 2 MB.");
      }

      const uploadedFile = await getPluginService("user").uploadAvatar({
        userId: session.user.id,
        file,
      });

      ctx.body = { url: uploadedFile.url };
    },

    /**
     * DELETE /users/me/avatar — used by better-auth-ui's `avatar.delete`
     * config. Gated by the `is-authenticated` policy, which populates
     * `ctx.state.betterAuthSession`.
     */
    async deleteAvatar(ctx) {
      const session = ctx.state.betterAuthSession;

      const { url } = ctx.request.body ?? {};
      if (!url) return ctx.badRequest("Missing url.");

      const deleted = await getPluginService("user").deleteAvatar({
        userId: session.user.id,
        url,
      });
      if (!deleted) return ctx.notFound();

      ctx.body = { success: true };
    },
  }),
);

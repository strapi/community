/**
 * template controller
 */

import { factories } from "@strapi/strapi";

const READ_ONLY_FIELDS = ["git_repository"] as const;

const EDITABLE_FIELDS = [
  "name",
  "description",
  "preview_image",
  "preview_link",
  "categories",
  "maintainers",
  "readme",
  "readme_auto_sync",
] as const;

export default factories.createCoreController("api::template.template", () => ({
  /**
   * PUT /api/templates/:id — reused by the web app's "Submissions" edit
   * form. See `api::package.package`'s controller override for the full
   * reasoning, including the approved-only edit gate; templates have no
   * `package_location` field, so only `git_repository` is read-only here.
   */
  async update(ctx) {
    const entry = ctx.state.contentEntry as Record<string, unknown>;
    const documentId = ctx.params.id as string;
    const incoming = (ctx.request.body?.data ?? {}) as Record<string, unknown>;

    if (entry.overall_status !== "approved") {
      return ctx.badRequest(
        "This submission cannot be edited until it has been approved.",
      );
    }

    for (const field of READ_ONLY_FIELDS) {
      if (field in incoming && incoming[field] !== entry[field]) {
        return ctx.badRequest(`${field} cannot be changed.`);
      }
    }

    ctx.request.body.data = Object.fromEntries(
      Object.entries(incoming).filter(([key]) =>
        (EDITABLE_FIELDS as readonly string[]).includes(key),
      ),
    );

    const result = await super.update(ctx);

    // See the same auto-republish reasoning on the package controller's
    // `update` override — apply the edit live immediately if this
    // template was already approved/published, otherwise leave it as a
    // draft awaiting its first moderation approval.
    const published = await strapi
      .documents("api::template.template")
      .findOne({ documentId, status: "published", fields: ["documentId"] });
    if (published) {
      await strapi.documents("api::template.template").publish({ documentId });
    }

    return result;
  },
}));

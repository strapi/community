/**
 * package controller
 */

import { factories } from "@strapi/strapi";

const READ_ONLY_FIELDS = ["git_repository", "package_location"] as const;

const EDITABLE_FIELDS = [
  "name",
  "description",
  "icon",
  "categories",
  "maintainers",
  "readme",
  "readme_auto_sync",
] as const;

export default factories.createCoreController("api::package.package", () => ({
  /**
   * PUT /api/packages/:id — reused by the web app's "Submissions" edit
   * form. The route's `is-content-owner` policy already restricts who
   * can reach this action at all (see `routes/package.ts`); this
   * override adds two more layers on top of that:
   *
   * - rejects the request outright if `git_repository`/`package_location`
   *   are present and differ from the current value — the edit form
   *   shows these as read-only ("we do not support updating this atm"),
   *   this is the server-side backstop for anyone calling the API
   *   directly;
   * - whitelists everything else down to just the fields the edit form
   *   actually exposes, so nothing else can be smuggled into this
   *   content-api-facing write path.
   */
  async update(ctx) {
    const entry = ctx.state.contentEntry as Record<string, unknown>;
    const documentId = ctx.params.id as string;
    const incoming = (ctx.request.body?.data ?? {}) as Record<string, unknown>;

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

    // Per product decision, an owner's edit applies immediately — no
    // re-entering moderation review. If this submission was already
    // approved and published, republish right away so the live version
    // picks up the change. A submission still awaiting its first
    // approval has no published version yet; leave it as a draft so
    // moderation still gates when it first goes live.
    const published = await strapi
      .documents("api::package.package")
      .findOne({ documentId, status: "published", fields: ["documentId"] });
    if (published) {
      await strapi.documents("api::package.package").publish({ documentId });
    }

    return result;
  },
}));

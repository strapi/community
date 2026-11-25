/**
 * roadmap-item controller
 *
 * The roadmap is public and read-only. Routes are `auth: false`, so the
 * query is the only thing standing between a caller and the drafts — which
 * hold items that failed validation (missing copy, paused, broken links) or
 * were unflagged in Notion. Force `status: "published"` on every read so a
 * `?status=draft` query string can never surface them.
 */

import { factories } from "@strapi/strapi";

function publishedOnly(query: Record<string, unknown> = {}) {
  return { ...query, status: "published" };
}

export default factories.createCoreController(
  "api::roadmap-item.roadmap-item",
  () => ({
    async find(ctx) {
      ctx.query = publishedOnly(ctx.query);
      return super.find(ctx);
    },

    async findOne(ctx) {
      ctx.query = publishedOnly(ctx.query);
      return super.findOne(ctx);
    },
  }),
);

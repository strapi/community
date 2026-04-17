const server = require("./server");

/**
 * Moderation plugin for the Strapi Marketplace.
 *
 * Architecture: Option B — separate moderation content type.
 *
 * Incoming plugin submissions are stored as plugin::moderation.plugin-submission
 * records. They go through two independent review tracks (business + security)
 * before a moderator can promote them to a real api::package.package entry.
 * This keeps unapproved content completely isolated from the live catalogue.
 */
module.exports = {
  register() {
    strapi.log.info("[moderation] plugin registered");
  },

  bootstrap() {},

  contentTypes: server.contentTypes,
  controllers: server.controllers,
  services: server.services,
  routes: server.routes,
};

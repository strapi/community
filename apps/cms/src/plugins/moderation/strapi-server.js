const server = require("./server");

/**
 * Moderation plugin for the Strapi Marketplace.
 *
 * Architecture: submissions create draft Package / Template records directly.
 * This plugin owns no content types — it provides the admin UI, routes,
 * controllers, and services that operate on api::package.package and
 * api::template.template. See docs/adr/0001-moderation-fields-on-package-not-intermediary.md.
 */
module.exports = {
  register() {
    strapi.log.info("[moderation] plugin registered");
  },

  bootstrap() {},

  controllers: server.controllers,
  services: server.services,
  routes: server.routes,
};

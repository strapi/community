const controller = require("./server/controller");
const routes = require("./server/routes");

module.exports = {
  register() {
    strapi.log.info("[owner-selector] plugin registered");
  },
  bootstrap() {},
  routes,
  controllers: { controller },
};

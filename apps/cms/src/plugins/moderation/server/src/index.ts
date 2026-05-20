import contentTypes from "./content-types";
import controllers from "./controllers";
import routes from "./routes";
import services from "./services";

export default {
  register() {
    strapi.log.info("[moderation] plugin registered");
  },

  bootstrap() {},

  contentTypes,
  controllers,
  services,
  routes,
};

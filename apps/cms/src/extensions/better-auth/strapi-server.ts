import organizationController from "./controllers/organization";
import userController from "./controllers/user";
import organizationRoutes from "./routes/organization";
import userRoutes from "./routes/user";
import organizationService from "./services/organization";
import userService from "./services/user";

export default (plugin) => {
  plugin.controllers.organization = organizationController;
  plugin.controllers.user = userController;

  if (!plugin.services) plugin.services = {};
  plugin.services.organization = organizationService;
  plugin.services.user = userService;

  plugin.routes["content-api"] = {
    type: "content-api",
    routes: [
      ...plugin.routes["content-api"]().routes,
      ...organizationRoutes["content-api"].routes,
      ...userRoutes["content-api"].routes,
    ],
  };

  return plugin;
};

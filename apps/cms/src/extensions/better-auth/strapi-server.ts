import organizationController from "./controllers/organization";
import userController from "./controllers/user";
import isAuthenticated from "./policies/is-authenticated";
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

  if (!plugin.policies) plugin.policies = {};
  plugin.policies["is-authenticated"] = isAuthenticated;

  plugin.routes["content-api"] = {
    type: "content-api",
    routes: [
      ...organizationRoutes["content-api"].routes,
      ...userRoutes["content-api"].routes,
    ],
  };

  return plugin;
};

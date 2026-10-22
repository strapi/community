import organizationController from "./controllers/organization";
import submissionsController from "./controllers/submissions";
import userController from "./controllers/user";
import isAuthenticated from "./policies/is-authenticated";
import isContentOwner from "./policies/is-content-owner";
import isOrganizationMember from "./policies/is-organization-member";
import isOrganizationOwner from "./policies/is-organization-owner";
import organizationRoutes from "./routes/organization";
import submissionsRoutes from "./routes/submissions";
import userRoutes from "./routes/user";
import organizationService from "./services/organization";
import submissionsService from "./services/submissions";
import userService from "./services/user";

export default (plugin) => {
  plugin.controllers.organization = organizationController;
  plugin.controllers.submissions = submissionsController;
  plugin.controllers.user = userController;

  if (!plugin.services) plugin.services = {};
  plugin.services.organization = organizationService;
  plugin.services.submissions = submissionsService;
  plugin.services.user = userService;

  if (!plugin.policies) plugin.policies = {};
  plugin.policies["is-authenticated"] = isAuthenticated;
  plugin.policies["is-content-owner"] = isContentOwner;
  plugin.policies["is-organization-member"] = isOrganizationMember;
  plugin.policies["is-organization-owner"] = isOrganizationOwner;

  plugin.routes["content-api"] = {
    type: "content-api",
    routes: [
      ...organizationRoutes["content-api"].routes,
      ...submissionsRoutes["content-api"].routes,
      ...userRoutes["content-api"].routes,
    ],
  };

  return plugin;
};

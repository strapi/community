import pluginSubmission from "./plugin-submission";
import templateSubmission from "./template-submission";

export default {
  "content-api": {
    type: "content-api" as const,
    routes: [
      ...pluginSubmission["content-api"].routes,
      ...templateSubmission["content-api"].routes,
    ],
  },
  admin: {
    type: "admin" as const,
    routes: [
      ...pluginSubmission.admin.routes,
      ...templateSubmission.admin.routes,
    ],
  },
};

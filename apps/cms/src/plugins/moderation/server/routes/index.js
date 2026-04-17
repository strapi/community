const pluginSubmission = require("./plugin-submission");
const templateSubmission = require("./template-submission");

module.exports = {
  "content-api": {
    type: "content-api",
    routes: [
      ...pluginSubmission["content-api"].routes,
      ...templateSubmission["content-api"].routes,
    ],
  },
  admin: {
    type: "admin",
    routes: [
      ...pluginSubmission.admin.routes,
      ...templateSubmission.admin.routes,
    ],
  },
};

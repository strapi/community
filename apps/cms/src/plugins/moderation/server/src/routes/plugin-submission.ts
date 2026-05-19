export default {
  "content-api": {
    type: "content-api",
    routes: [
      {
        method: "POST",
        path: "/packages/submit",
        handler: "plugin-submission.create",
        config: {
          // Next.js proxy sends a valid API token — auth must be true.
          auth: true,
          policies: [],
        },
      },
      {
        method: "POST",
        path: "/packages/:documentId/security-scan-result",
        handler: "plugin-submission.updateSecurityScan",
        config: { auth: true, policies: [] },
      },
      {
        method: "GET",
        path: "/packages/stale-scans",
        handler: "plugin-submission.listStaleScans",
        config: { auth: true, policies: [] },
      },
    ],
  },
  admin: {
    type: "admin",
    routes: [
      {
        method: "GET",
        path: "/submissions",
        handler: "plugin-submission.find",
        config: { policies: [] },
      },
      {
        method: "GET",
        path: "/submissions/:documentId",
        handler: "plugin-submission.findOne",
        config: { policies: [] },
      },
      {
        method: "PUT",
        path: "/submissions/:documentId/review",
        handler: "plugin-submission.updateReview",
        config: { policies: [] },
      },
      {
        method: "POST",
        path: "/submissions/:documentId/publish",
        handler: "plugin-submission.publish",
        config: { policies: [] },
      },
      {
        method: "POST",
        path: "/submissions/:documentId/decide",
        handler: "plugin-submission.decide",
        config: { policies: [] },
      },
      {
        method: "POST",
        path: "/submissions/:documentId/run-security-scan",
        handler: "plugin-submission.runSecurityScan",
        config: { policies: [] },
      },
    ],
  },
};

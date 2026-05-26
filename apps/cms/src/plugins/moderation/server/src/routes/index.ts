export default {
  "content-api": {
    type: "content-api" as const,
    routes: [
      {
        method: "POST",
        path: "/:plural/submit",
        handler: "submission.create",
        config: { auth: { scope: [] }, policies: [] },
      },
      {
        method: "POST",
        path: "/:plural/:documentId/security-scan-result",
        handler: "submission.updateSecurityScan",
        config: { auth: { scope: [] }, policies: [] },
      },
      {
        method: "GET",
        path: "/:plural/stale-scans",
        handler: "submission.listStaleScans",
        config: { auth: { scope: [] }, policies: [] },
      },
    ],
  },
  admin: {
    type: "admin" as const,
    routes: [
      {
        method: "GET",
        path: "/config",
        handler: "submission.getConfig",
        config: { policies: [] },
      },
      {
        method: "GET",
        path: "/:plural/submissions",
        handler: "submission.find",
        config: { policies: [] },
      },
      {
        method: "GET",
        path: "/:plural/submissions/:documentId",
        handler: "submission.findOne",
        config: { policies: [] },
      },
      {
        method: "PUT",
        path: "/:plural/submissions/:documentId/review",
        handler: "submission.updateReview",
        config: { policies: [] },
      },
      {
        method: "POST",
        path: "/:plural/submissions/:documentId/publish",
        handler: "submission.publish",
        config: { policies: [] },
      },
      {
        method: "POST",
        path: "/:plural/submissions/:documentId/decide",
        handler: "submission.decide",
        config: { policies: [] },
      },
      {
        method: "POST",
        path: "/:plural/submissions/:documentId/run-security-scan",
        handler: "submission.runSecurityScan",
        config: { policies: [] },
      },
    ],
  },
};

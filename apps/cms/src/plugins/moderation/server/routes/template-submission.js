module.exports = {
  "content-api": {
    type: "content-api",
    routes: [
      {
        method: "POST",
        path: "/template-submissions",
        handler: "template-submission.create",
        config: {
          // Public endpoint — auth is handled at the Next.js proxy layer.
          // The proxy must include a valid API token via Authorization header.
          auth: false,
          policies: [],
        },
      },
      {
        method: "POST",
        path: "/template-submissions/:documentId/security-scan-result",
        handler: "template-submission.updateSecurityScan",
        config: {
          // Called by n8n over the public API using a Strapi API token.
          policies: [],
        },
      },
      {
        method: "GET",
        path: "/template-submissions/stale-scans",
        handler: "template-submission.listStaleScans",
        config: {
          policies: [],
        },
      },
    ],
  },
  admin: {
    type: "admin",
    routes: [
      {
        method: "GET",
        path: "/template-submissions",
        handler: "template-submission.find",
        config: { policies: [] },
      },
      {
        method: "GET",
        path: "/template-submissions/:documentId",
        handler: "template-submission.findOne",
        config: { policies: [] },
      },
      {
        method: "PUT",
        path: "/template-submissions/:documentId/review",
        handler: "template-submission.updateReview",
        config: { policies: [] },
      },
      {
        method: "POST",
        path: "/template-submissions/:documentId/decide",
        handler: "template-submission.decide",
        config: { policies: [] },
      },
      {
        method: "POST",
        path: "/template-submissions/:documentId/run-security-scan",
        handler: "template-submission.runSecurityScan",
        config: { policies: [] },
      },
    ],
  },
};

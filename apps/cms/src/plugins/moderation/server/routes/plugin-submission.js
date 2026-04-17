module.exports = {
  "content-api": {
    type: "content-api",
    routes: [
      {
        method: "POST",
        path: "/plugin-submissions",
        handler: "plugin-submission.create",
        config: {
          // Public endpoint — auth is handled at the Next.js proxy layer.
          // The proxy must include a valid API token via Authorization header.
          auth: false,
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
        path: "/submissions/:documentId/promote",
        handler: "plugin-submission.promote",
        config: { policies: [] },
      },
      {
        method: "POST",
        path: "/submissions/:documentId/decide",
        handler: "plugin-submission.decide",
        config: { policies: [] },
      },
    ],
  },
};

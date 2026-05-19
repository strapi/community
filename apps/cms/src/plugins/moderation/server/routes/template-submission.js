module.exports = {
  "content-api": {
    type: "content-api",
    routes: [
      {
        method: "POST",
        path: "/templates/submit",
        handler: "template-submission.create",
        config: {
          auth: true,
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
        path: "/template-submissions/:documentId/publish",
        handler: "template-submission.publish",
        config: { policies: [] },
      },
      {
        method: "POST",
        path: "/template-submissions/:documentId/decide",
        handler: "template-submission.decide",
        config: { policies: [] },
      },
    ],
  },
};

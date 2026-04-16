export default {
  "content-api": {
    type: "content-api",
    routes: [
      {
        method: "GET",
        path: "/organizations",
        handler: "organization.find",
        config: {
          policies: [],
          prefix: "",
        },
      },
      {
        method: "GET",
        path: "/organizations/:id",
        handler: "organization.findOne",
        config: {
          policies: [],
          prefix: "",
        },
      },
      {
        method: "GET",
        path: "/organizations/:id/related-content",
        handler: "organization.relatedContent",
        config: { policies: [], middlewares: [], prefix: "" },
      },
    ],
  },
};

export default {
  "content-api": {
    type: "content-api",
    routes: [
      {
        method: "GET",
        path: "/users",
        handler: "user.find",
        config: {
          policies: [],
          prefix: "",
        },
      },
      {
        method: "GET",
        path: "/users/:id",
        handler: "user.findOne",
        config: {
          policies: [],
          prefix: "",
        },
      },
      {
        method: "GET",
        path: "/users/:id/related-content",
        handler: "user.relatedContent",
        config: { policies: [], middlewares: [], prefix: "" },
      },
    ],
  },
};

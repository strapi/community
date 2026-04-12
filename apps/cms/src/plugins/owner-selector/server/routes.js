module.exports = {
  admin: {
    type: "admin",
    routes: [
      {
        method: "GET",
        path: "/users",
        handler: "controller.getUsers",
        config: { policies: [] },
      },
      {
        method: "GET",
        path: "/organizations",
        handler: "controller.getOrganizations",
        config: { policies: [] },
      },
      {
        method: "GET",
        path: "/owner",
        handler: "controller.getOwner",
        config: { policies: [] },
      },
      {
        method: "PUT",
        path: "/owner",
        handler: "controller.setOwner",
        config: { policies: [] },
      },
    ],
  },
};

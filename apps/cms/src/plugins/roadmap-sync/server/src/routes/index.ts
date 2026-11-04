export default {
  "content-api": {
    type: "content-api" as const,
    routes: [
      {
        method: "POST",
        path: "/run",
        handler: "sync.run",
        // Guarded by the ROADMAP_SYNC_SECRET header in the controller.
        config: { auth: false, policies: [] },
      },
    ],
  },
};

// The addon's content-api routes (sitemap XML + its XSL assets) require a
// permission on the Public role by default. Search engines can't
// authenticate, so serve them without auth.
export default (plugin) => {
  const contentApi = plugin.routes["content-api"];

  contentApi.routes = contentApi.routes.map((route) => ({
    ...route,
    config: { ...route.config, auth: false },
  }));

  return plugin;
};

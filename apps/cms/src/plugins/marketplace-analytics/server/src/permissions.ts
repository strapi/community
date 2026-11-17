/**
 * RBAC action(s) for this plugin.
 *
 * MCP clients authenticate with an admin API token whose role must hold the
 * matching permission. The MCP tool auth gate (`auth.policies`) checks the
 * session's ability against `ACTION.ANALYTICS_READ`, so a token can only call
 * these tools if its role has been granted "Marketplace Analytics → Read" in
 * Settings → Roles.
 *
 * This is the same mechanism `@strapi-community/plugin-better-auth-dashboard`
 * uses to gate its MCP tools.
 */
export const PLUGIN_ID = "marketplace-analytics";

export const ACTION = {
  ANALYTICS_READ: `plugin::${PLUGIN_ID}.analytics.read`,
} as const;

/** Passed to `strapi.admin.services.permission.actionProvider.registerMany`. */
export const ACTIONS = [
  {
    section: "plugins",
    subCategory: "analytics",
    displayName: "Read",
    pluginName: PLUGIN_ID,
    uid: "analytics.read",
  },
];

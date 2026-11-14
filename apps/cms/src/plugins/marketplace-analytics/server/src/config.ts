/**
 * Plugin config.
 *
 * `mcp.enabled` gates whether this plugin registers its analytics tools on
 * Strapi's native MCP server (served at POST /mcp, enabled globally in
 * `config/server.ts`). Mirrors the `better-auth-dashboard` plugin's own
 * `mcp.enabled` switch so the two behave consistently.
 */
export default {
  default: {
    mcp: { enabled: true },
  },
  validator(config: { mcp?: { enabled?: unknown } }) {
    if (
      config.mcp !== undefined &&
      config.mcp.enabled !== undefined &&
      typeof config.mcp.enabled !== "boolean"
    ) {
      throw new Error("[marketplace-analytics] mcp.enabled must be a boolean");
    }
  },
};

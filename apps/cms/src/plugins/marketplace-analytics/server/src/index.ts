import type { Core } from "@strapi/strapi";
import config from "./config";
import { registerMcpTools } from "./mcp/register";
import { ACTIONS, PLUGIN_ID } from "./permissions";

export default {
  config,

  register({ strapi }: { strapi: Core.Strapi }) {
    // Register the RBAC action so it appears under Settings → Roles and can be
    // granted to the admin API token's role that MCP clients authenticate with.
    strapi.admin.services.permission.actionProvider.registerMany(ACTIONS);

    const enabled = strapi.config.get(`plugin::${PLUGIN_ID}.mcp.enabled`, true);
    if (!enabled) return;

    // Strapi's native MCP server (requires Strapi >= 5.47, enabled in
    // config/server.ts). Tools must be registered during the register phase,
    // before the MCP server starts in bootstrap.
    const mcp = strapi.ai?.mcp;
    if (!mcp) {
      strapi.log.warn(
        `[${PLUGIN_ID}] MCP is enabled but this Strapi has no MCP server; skipping tool registration.`,
      );
      return;
    }

    try {
      registerMcpTools(mcp);
      strapi.log.info(
        `[${PLUGIN_ID}] Registered marketplace analytics MCP tools.`,
      );
    } catch (error) {
      strapi.log.warn(
        `[${PLUGIN_ID}] Failed to register MCP tools: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  },

  bootstrap() {},
};

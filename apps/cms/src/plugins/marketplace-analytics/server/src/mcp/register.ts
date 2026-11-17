import type { Modules } from "@strapi/strapi";
import { registerPartnerSignupStats } from "./tools/partner-signup-stats";
import { registerPartnerSignupsGraph } from "./tools/partner-signups-graph";
import { registerSubmissionStats } from "./tools/submission-stats";
import { registerSubmissionsGraph } from "./tools/submissions-graph";

/** Register every marketplace analytics tool on the MCP server. */
export function registerMcpTools(mcp: Modules.MCP.McpService) {
  registerSubmissionStats(mcp);
  registerSubmissionsGraph(mcp);
  registerPartnerSignupStats(mcp);
  registerPartnerSignupsGraph(mcp);
}

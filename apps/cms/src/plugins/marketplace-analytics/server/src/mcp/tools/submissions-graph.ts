import type { Modules } from "@strapi/strapi";
import { z } from "@strapi/utils";
import { ACTION } from "../../permissions";
import { fetchSubmissions } from "../data";
import {
  buildTimeSeries,
  errorMessage,
  toolError,
  toolResult,
} from "../helpers";

type Mcp = Modules.MCP.McpService;

export function registerSubmissionsGraph(mcp: Mcp) {
  mcp.registerTool({
    name: "marketplace_submissions_graph",
    title: "Marketplace submissions over time",
    description:
      "Return a time series of marketplace submissions (plugins + templates) bucketed by day, week or month, using each submission's creation date. Each point has the new submissions in that bucket and the running cumulative total. Optionally restrict to one type.",
    auth: { policies: [{ action: ACTION.ANALYTICS_READ }] },
    resolveInputSchema: () =>
      z.object({
        period: z.enum(["daily", "weekly", "monthly"]).default("daily"),
        type: z.enum(["plugin", "template", "all"]).default("all"),
      }),
    resolveOutputSchema: () =>
      z.object({
        period: z.string(),
        type: z.string(),
        total: z.number(),
        points: z.array(
          z.object({
            date: z.string(),
            label: z.string(),
            count: z.number(),
            cumulative: z.number(),
          }),
        ),
      }),
    createHandler:
      (strapi) =>
      async ({ args }) => {
        try {
          const rows = await fetchSubmissions(strapi, { type: args.type });
          const points = buildTimeSeries(
            rows.map((r) => r.createdAt),
            args.period,
          );

          return toolResult({
            period: args.period,
            type: args.type,
            total: rows.length,
            points,
          });
        } catch (e) {
          return toolError(
            `Failed to load submissions graph: ${errorMessage(e)}`,
          );
        }
      },
  });
}

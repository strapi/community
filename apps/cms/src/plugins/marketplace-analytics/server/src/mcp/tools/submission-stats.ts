import type { Modules } from "@strapi/strapi";
import { z } from "@strapi/utils";
import { ACTION } from "../../permissions";
import {
  fetchSubmissions,
  SUBMISSION_STATUSES,
  type SubmissionStatus,
} from "../data";
import { errorMessage, toolError, toolResult } from "../helpers";

type Mcp = Modules.MCP.McpService;

export function registerSubmissionStats(mcp: Mcp) {
  mcp.registerTool({
    name: "marketplace_submission_stats",
    title: "Marketplace submission stats",
    description:
      "Count marketplace submissions (plugins + templates), broken down by content type and by moderation status (submitted, under_review, changes_requested, rejected, approved). Optionally restrict to one type or to submissions created on/after a date.",
    auth: { policies: [{ action: ACTION.ANALYTICS_READ }] },
    resolveInputSchema: () =>
      z.object({
        type: z
          .enum(["plugin", "template", "all"])
          .default("all")
          .describe("Which submission type to count"),
        since: z
          .string()
          .optional()
          .describe(
            "ISO date/datetime; only count submissions created on/after it",
          ),
      }),
    resolveOutputSchema: () =>
      z.object({
        total: z.number(),
        byType: z.object({
          plugin: z.number(),
          template: z.number(),
        }),
        byStatus: z.object({
          submitted: z.number(),
          under_review: z.number(),
          changes_requested: z.number(),
          rejected: z.number(),
          approved: z.number(),
          unknown: z.number(),
        }),
      }),
    createHandler:
      (strapi) =>
      async ({ args }) => {
        try {
          const rows = await fetchSubmissions(strapi, {
            type: args.type,
            since: args.since,
          });

          const byType = { plugin: 0, template: 0 };
          const byStatus: Record<SubmissionStatus | "unknown", number> = {
            submitted: 0,
            under_review: 0,
            changes_requested: 0,
            rejected: 0,
            approved: 0,
            unknown: 0,
          };

          for (const row of rows) {
            byType[row.type] += 1;
            byStatus[row.status] += 1;
          }

          void SUBMISSION_STATUSES; // keep status list the single source of truth

          return toolResult({ total: rows.length, byType, byStatus });
        } catch (e) {
          return toolError(
            `Failed to load submission stats: ${errorMessage(e)}`,
          );
        }
      },
  });
}

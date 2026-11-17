import type { Modules } from "@strapi/strapi";
import { z } from "@strapi/utils";
import { ACTION } from "../../permissions";
import { fetchPartners } from "../data";
import {
  buildTimeSeries,
  errorMessage,
  toolError,
  toolResult,
} from "../helpers";

type Mcp = Modules.MCP.McpService;

export function registerPartnerSignupsGraph(mcp: Mcp) {
  mcp.registerTool({
    name: "marketplace_partner_signups_graph",
    title: "Partner sign-ups over time",
    description:
      "Return a time series of partner sign-ups bucketed by day, week or month. A partner signs up when it first gains an owner; each sign-up is dated by that first owner's membership date. Each point has the new sign-ups in that bucket and the running cumulative total.",
    auth: { policies: [{ action: ACTION.ANALYTICS_READ }] },
    resolveInputSchema: () =>
      z.object({
        period: z.enum(["daily", "weekly", "monthly"]).default("daily"),
      }),
    resolveOutputSchema: () =>
      z.object({
        period: z.string(),
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
          const partners = await fetchPartners(strapi);
          const signupDates = partners
            .map((p) => p.ownerSince)
            .filter((d): d is string => d !== null);

          const points = buildTimeSeries(signupDates, args.period);

          return toolResult({
            period: args.period,
            total: signupDates.length,
            points,
          });
        } catch (e) {
          return toolError(
            `Failed to load partner sign-ups graph: ${errorMessage(e)}`,
          );
        }
      },
  });
}

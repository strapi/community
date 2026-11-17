import type { Modules } from "@strapi/strapi";
import { z } from "@strapi/utils";
import { ACTION } from "../../permissions";
import { fetchPartners, type PartnerLevel } from "../data";
import { errorMessage, toolError, toolResult } from "../helpers";

type Mcp = Modules.MCP.McpService;

const LEVELS: PartnerLevel[] = [
  "Enterprise",
  "Business",
  "Community",
  "unspecified",
];

export function registerPartnerSignupStats(mcp: Mcp) {
  mcp.registerTool({
    name: "marketplace_partner_signup_stats",
    title: "Partner sign-up stats",
    description:
      "Count partner sign-ups. A partner sign-up is a partner organization (partner = true) that has at least one owner — i.e. an owner was added to a partner that previously had none, whether the partner was created with an owner or gained one later. Returns the total partners, how many have signed up (have an owner) vs are still pending (no owner), and a breakdown by partner level.",
    auth: { policies: [{ action: ACTION.ANALYTICS_READ }] },
    resolveOutputSchema: () =>
      z.object({
        totalPartners: z.number(),
        signedUp: z
          .number()
          .describe("Partners with at least one owner — the sign-up count"),
        pending: z.number().describe("Partners that have no owner yet"),
        byLevel: z.object({
          Enterprise: z.object({ total: z.number(), signedUp: z.number() }),
          Business: z.object({ total: z.number(), signedUp: z.number() }),
          Community: z.object({ total: z.number(), signedUp: z.number() }),
          unspecified: z.object({ total: z.number(), signedUp: z.number() }),
        }),
      }),
    createHandler: (strapi) => async () => {
      try {
        const partners = await fetchPartners(strapi);

        const byLevel = Object.fromEntries(
          LEVELS.map((level) => [level, { total: 0, signedUp: 0 }]),
        ) as Record<PartnerLevel, { total: number; signedUp: number }>;

        let signedUp = 0;
        for (const partner of partners) {
          const hasOwner = partner.ownerSince !== null;
          byLevel[partner.level].total += 1;
          if (hasOwner) {
            byLevel[partner.level].signedUp += 1;
            signedUp += 1;
          }
        }

        return toolResult({
          totalPartners: partners.length,
          signedUp,
          pending: partners.length - signedUp,
          byLevel,
        });
      } catch (e) {
        return toolError(
          `Failed to load partner sign-up stats: ${errorMessage(e)}`,
        );
      }
    },
  });
}

import type { Core } from "@strapi/strapi";
import {
  PARTNER_LEVELS,
  type PartnerLevel,
} from "../extensions/better-auth/utils/partner-levels";

type Benefit = {
  levels: PartnerLevel[];
  title: string;
  description: string;
};

const ALL: PartnerLevel[] = [...PARTNER_LEVELS];
const COMMUNITY_UP: PartnerLevel[] = ["Community", "Business", "Enterprise"];
const BUSINESS_UP: PartnerLevel[] = ["Business", "Enterprise"];

// The portal shows a benefit to every level it lists.
const benefits: Benefit[] = [
  {
    levels: ALL,
    title: "Partner portal",
    description:
      "Sales and technical resources, recordings and assets in one place.",
  },
  {
    levels: ALL,
    title: "Partner newsletter",
    description: "A monthly email with product news and program updates.",
  },
  {
    levels: ALL,
    title: "Enablement sessions",
    description:
      "Live product and sales sessions with the Strapi team, recorded for later.",
  },
  {
    levels: ALL,
    title: "Sales support",
    description:
      "Bring Strapi's sales team into demos and technical calls with your clients.",
  },
  {
    levels: COMMUNITY_UP,
    title: "Directory listing and Discord role",
    description:
      "A public profile on strapi.io/partners and an official partner role on the Strapi Discord.",
  },
  {
    levels: COMMUNITY_UP,
    title: "Partner demo licenses",
    description:
      "A CMS Enterprise license and a Strapi Cloud Pro plan for internal builds and client demos.",
  },
  {
    levels: COMMUNITY_UP,
    title: "Partner badge",
    description:
      "Display your Strapi partner badge on your website and in proposals.",
  },
  {
    levels: COMMUNITY_UP,
    title: "Co-marketing",
    description:
      "We share your Strapi blog posts, case studies, events and social posts on our channels.",
  },
  {
    levels: COMMUNITY_UP,
    title: "Partner highlights",
    description:
      "Your Strapi work featured in our newsletter and on social media.",
  },
  {
    levels: COMMUNITY_UP,
    title: "Short-form video and community calls",
    description:
      "Join Strapi live streams, community calls and short-form video.",
  },
  {
    levels: BUSINESS_UP,
    title: "Lead routing",
    description: "Priority when clients ask us for an implementation partner.",
  },
  {
    levels: ["Business"],
    title: "Standard support",
    description:
      "Access to Strapi support for any version of Strapi you're working on. No SLA.",
  },
  {
    levels: ["Business"],
    title: "5% discount",
    description:
      "On Strapi CMS Enterprise and Cloud subscriptions for your partner-registered deals.",
  },
  {
    levels: ["Enterprise"],
    title: "Premium support",
    description:
      "Premium support across your projects, with a dedicated Slack channel.",
  },
  {
    levels: ["Enterprise"],
    title: "10% discount",
    description:
      "On Strapi CMS Enterprise and Cloud subscriptions for your partner-registered deals.",
  },
  {
    levels: ["Enterprise"],
    title: "Strategic marketing",
    description:
      "Joint event and conference sponsorship, agreed with our marketing team.",
  },
];

/**
 * Creates the partner program single type with its benefits,
 * once — after that it's edited in the admin panel.
 */
export async function seedPartnerProgram(strapi: Core.Strapi): Promise<void> {
  const existing = await strapi
    .documents("api::partner-program.partner-program")
    .findFirst();

  if (existing) return;

  await strapi
    .documents("api::partner-program.partner-program")
    .create({ data: { benefits } });

  strapi.log.info("[seed] Created partner program");
}

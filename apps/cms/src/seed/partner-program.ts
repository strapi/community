import type { Core } from "@strapi/strapi";

type Benefit = {
  level: "Unlisted" | "Community" | "Business" | "Enterprise";
  title: string;
  description: string;
};

// The portal shows benefits whose level matches exactly, so each level
// lists all of its benefits, not just what it adds.
const benefits: Benefit[] = [
  {
    level: "Unlisted",
    title: "Partner portal",
    description:
      "Sales and technical resources, recordings and assets in one place.",
  },
  {
    level: "Unlisted",
    title: "Partner newsletter",
    description: "A monthly email with product news and program updates.",
  },
  {
    level: "Unlisted",
    title: "Enablement sessions",
    description:
      "Live product and sales sessions with the Strapi team, recorded for later.",
  },
  {
    level: "Unlisted",
    title: "Sales support",
    description:
      "Bring Strapi's sales team into demos and technical calls with your clients.",
  },
  {
    level: "Community",
    title: "Partner portal",
    description:
      "Sales and technical resources, recordings and assets in one place.",
  },
  {
    level: "Community",
    title: "Partner newsletter",
    description: "A monthly email with product news and program updates.",
  },
  {
    level: "Community",
    title: "Enablement sessions",
    description:
      "Live product and sales sessions with the Strapi team, recorded for later.",
  },
  {
    level: "Community",
    title: "Sales support",
    description:
      "Bring Strapi's sales team into demos and technical calls with your clients.",
  },
  {
    level: "Community",
    title: "Directory listing and Discord role",
    description:
      "A public profile on strapi.io/partners and an official partner role on the Strapi Discord.",
  },
  {
    level: "Community",
    title: "Partner demo licenses",
    description:
      "A CMS Enterprise license and a Strapi Cloud Pro plan for internal builds and client demos.",
  },
  {
    level: "Community",
    title: "Partner badge",
    description:
      "Display your Strapi partner badge on your website and in proposals.",
  },
  {
    level: "Community",
    title: "Co-marketing",
    description:
      "We share your Strapi blog posts, case studies, events and social posts on our channels.",
  },
  {
    level: "Community",
    title: "Partner highlights",
    description:
      "Your Strapi work featured in our newsletter and on social media.",
  },
  {
    level: "Community",
    title: "Short-form video and community calls",
    description:
      "Join Strapi live streams, community calls and short-form video.",
  },
  {
    level: "Business",
    title: "Partner portal",
    description:
      "Sales and technical resources, recordings and assets in one place.",
  },
  {
    level: "Business",
    title: "Partner newsletter",
    description: "A monthly email with product news and program updates.",
  },
  {
    level: "Business",
    title: "Enablement sessions",
    description:
      "Live product and sales sessions with the Strapi team, recorded for later.",
  },
  {
    level: "Business",
    title: "Sales support",
    description:
      "Bring Strapi's sales team into demos and technical calls with your clients.",
  },
  {
    level: "Business",
    title: "Directory listing and Discord role",
    description:
      "A public profile on strapi.io/partners and an official partner role on the Strapi Discord.",
  },
  {
    level: "Business",
    title: "Partner demo licenses",
    description:
      "A CMS Enterprise license and a Strapi Cloud Pro plan for internal builds and client demos.",
  },
  {
    level: "Business",
    title: "Partner badge",
    description:
      "Display your Strapi partner badge on your website and in proposals.",
  },
  {
    level: "Business",
    title: "Co-marketing",
    description:
      "We share your Strapi blog posts, case studies, events and social posts on our channels.",
  },
  {
    level: "Business",
    title: "Partner highlights",
    description:
      "Your Strapi work featured in our newsletter and on social media.",
  },
  {
    level: "Business",
    title: "Short-form video and community calls",
    description:
      "Join Strapi live streams, community calls and short-form video.",
  },
  {
    level: "Business",
    title: "Standard support",
    description:
      "Access to Strapi support for any version of Strapi you're working on. No SLA.",
  },
  {
    level: "Business",
    title: "Lead routing",
    description: "Priority when clients ask us for an implementation partner.",
  },
  {
    level: "Business",
    title: "5% discount",
    description:
      "On Strapi CMS Enterprise and Cloud subscriptions for your partner-registered deals.",
  },
  {
    level: "Enterprise",
    title: "Partner portal",
    description:
      "Sales and technical resources, recordings and assets in one place.",
  },
  {
    level: "Enterprise",
    title: "Partner newsletter",
    description: "A monthly email with product news and program updates.",
  },
  {
    level: "Enterprise",
    title: "Enablement sessions",
    description:
      "Live product and sales sessions with the Strapi team, recorded for later.",
  },
  {
    level: "Enterprise",
    title: "Sales support",
    description:
      "Bring Strapi's sales team into demos and technical calls with your clients.",
  },
  {
    level: "Enterprise",
    title: "Directory listing and Discord role",
    description:
      "A public profile on strapi.io/partners and an official partner role on the Strapi Discord.",
  },
  {
    level: "Enterprise",
    title: "Partner demo licenses",
    description:
      "A CMS Enterprise license and a Strapi Cloud Pro plan for internal builds and client demos.",
  },
  {
    level: "Enterprise",
    title: "Partner badge",
    description:
      "Display your Strapi partner badge on your website and in proposals.",
  },
  {
    level: "Enterprise",
    title: "Co-marketing",
    description:
      "We share your Strapi blog posts, case studies, events and social posts on our channels.",
  },
  {
    level: "Enterprise",
    title: "Partner highlights",
    description:
      "Your Strapi work featured in our newsletter and on social media.",
  },
  {
    level: "Enterprise",
    title: "Short-form video and community calls",
    description:
      "Join Strapi live streams, community calls and short-form video.",
  },
  {
    level: "Enterprise",
    title: "Premium support",
    description:
      "Premium support across your projects, with a dedicated Slack channel.",
  },
  {
    level: "Enterprise",
    title: "Lead routing",
    description: "Priority when clients ask us for an implementation partner.",
  },
  {
    level: "Enterprise",
    title: "10% discount",
    description:
      "On Strapi CMS Enterprise and Cloud subscriptions for your partner-registered deals.",
  },
  {
    level: "Enterprise",
    title: "Strategic marketing",
    description:
      "Joint event and conference sponsorship, agreed with our marketing team.",
  },
];

/**
 * Creates the partner program single type with its per-level benefits,
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

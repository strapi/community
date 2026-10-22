import type { Core } from "@strapi/strapi";

type Seed = {
  title: string;
  description: string;
  section: "sales_enablement" | "tech_enablement" | "reusable_content";
  label?: string;
  category?: string;
  /** A lucide icon name, as stored by the `strapi-lucide-icons` field. */
  icon: string;
};

// Initial partner portal content, from the partner portal design. No
// bodies, files or links yet — those are added by the partner team.
const seeds: Seed[] = [
  {
    section: "sales_enablement",
    title: "Partner sales playbook",
    description:
      "Discovery questions, qualification and positioning against other CMSs.",
    label: "Guide",
    icon: "book-marked",
  },
  {
    section: "sales_enablement",
    title: "Pricing & packaging",
    description:
      "Current Strapi Cloud and Enterprise pricing for client proposals.",
    label: "PDF",
    icon: "tag",
  },
  {
    section: "sales_enablement",
    title: "Competitive battlecards",
    description: "How Strapi compares with Contentful, Sanity and WordPress.",
    label: "PDF",
    icon: "swords",
  },
  {
    section: "sales_enablement",
    title: "Deal registration guide",
    description: "How registration works and what protection it gives you.",
    label: "Guide",
    icon: "handshake",
  },
  {
    section: "sales_enablement",
    title: "Sales training sessions",
    description: "Recorded and upcoming sessions with the Strapi sales team.",
    label: "Video",
    icon: "monitor-play",
  },
  {
    section: "sales_enablement",
    title: "Request a joint call",
    description: "Bring a Strapi account executive into a client conversation.",
    label: "Booking",
    icon: "phone-call",
  },
  {
    section: "tech_enablement",
    title: "Strapi certification",
    description: "Certify your developers on Strapi 5 and earn tier credit.",
    label: "Course",
    icon: "scroll-text",
  },
  {
    section: "tech_enablement",
    title: "Architecture guides",
    description:
      "Reference architectures for enterprise and multi-site projects.",
    label: "Docs",
    icon: "network",
  },
  {
    section: "tech_enablement",
    title: "Partner sandbox",
    description:
      "Enterprise and Cloud licences for demos and internal projects.",
    label: "Access",
    icon: "flask-conical",
  },
  {
    section: "tech_enablement",
    title: "Technical office hours",
    description: "Book time with Strapi solutions engineers.",
    label: "Booking",
    icon: "calendar-check",
  },
  {
    section: "tech_enablement",
    title: "Migration toolkit",
    description: "Scripts and guides for moving clients from other CMSs.",
    label: "Toolkit",
    icon: "repeat",
  },
  {
    section: "tech_enablement",
    title: "Release briefings",
    description: "Early walkthroughs of upcoming Strapi releases.",
    label: "Webinar",
    icon: "rocket",
  },
  {
    section: "reusable_content",
    title: "Strapi logo pack",
    description: "The Strapi logo in every format and colorway.",
    category: "Logos & brand kit",
    label: "SVG, PNG",
    icon: "shapes",
  },
  {
    section: "reusable_content",
    title: "Partner badge — all tiers",
    description: "Show your partner level on your website and proposals.",
    category: "Logos & brand kit",
    label: "SVG",
    icon: "badge-check",
  },
  {
    section: "reusable_content",
    title: "Co-branded one-pager",
    description: "A one-page Strapi + partner overview for client pitches.",
    category: "Co-branded templates",
    label: "Figma, PDF",
    icon: "file-text",
  },
  {
    section: "reusable_content",
    title: "Joint webinar slides",
    description: "A slide template for webinars run together with Strapi.",
    category: "Co-branded templates",
    label: "Google Slides",
    icon: "presentation",
  },
];

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Creates the initial partner resources (published), but only while the
 * collection is still empty — once the partner team starts editing, it
 * never touches it again.
 */
export async function seedPartnerResources(strapi: Core.Strapi): Promise<void> {
  const documents = strapi.documents("api::partner-resource.partner-resource");

  if ((await documents.count({})) > 0) return;

  for (const [index, seed] of seeds.entries()) {
    await documents.create({
      data: {
        ...seed,
        slug: slugify(seed.title),
        minimum_level: "Community",
        sort_order: index,
      },
      status: "published",
    });
  }

  strapi.log.info(`[seed] Created ${seeds.length} partner resources`);
}

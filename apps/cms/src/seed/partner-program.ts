import type { Core } from "@strapi/strapi";

type Benefit = {
  level: "Unlisted" | "Community" | "Business" | "Enterprise";
  title: string;
  description?: string;
};

const enablement: Omit<Benefit, "level">[] = [
  {
    title: "Sales enablement",
    description: "Playbooks, pricing and battlecards to help you win pitches.",
  },
  {
    title: "Tech enablement",
    description: "Training, certification and resources for your team.",
  },
];

const benefits: Benefit[] = [
  ...enablement.map((benefit) => ({ ...benefit, level: "Community" as const })),
  ...enablement.map((benefit) => ({ ...benefit, level: "Business" as const })),
  { level: "Business", title: "Lead sharing" },
  { level: "Business", title: "5% discount" },
  ...enablement.map((benefit) => ({
    ...benefit,
    level: "Enterprise" as const,
  })),
  { level: "Enterprise", title: "Lead sharing" },
  { level: "Enterprise", title: "10% discount" },
];

/**
 * Creates the partner program single type with its initial per-level
 * benefits, once — after that it's edited in the admin panel.
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

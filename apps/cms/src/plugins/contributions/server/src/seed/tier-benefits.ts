import type { Core } from "@strapi/strapi";

/**
 * Seeds the benefits contributors get at each tier (shown on their
 * personal contributions dashboard — including the Discord role, see the
 * `discord` service) — only when there are none yet, so
 * editors own the list from then on. Only seeds what the platform does
 * today; real-world perks (swag, event invites, …) are for the team to add
 * in the admin under "Contributor Tier Benefits".
 */
const seeds = [
  {
    tier: "bronze",
    title: "Contributor badge",
    description:
      "A Bronze Contributor badge on your profile and on your card in the members directory.",
  },
  {
    tier: "bronze",
    title: "Findable as a contributor",
    description:
      "You appear when people filter the members directory by contributor tier, and in its Top Contributors ranking.",
  },
  {
    tier: "silver",
    title: "Silver Contributor badge",
    description: "Your badge on your profile and member card turns silver.",
  },
  {
    tier: "gold",
    title: "Gold Contributor badge",
    description: "Your badge on your profile and member card turns gold.",
  },
  {
    tier: "platinum",
    title: "Platinum Contributor badge",
    description:
      "The highest badge there is, on your profile and member card — reserved for the community's most impactful contributors.",
  },
  ...(["bronze", "silver", "gold", "platinum"] as const).map((tier) => ({
    tier,
    title: "Role on Discord",
    description: `The ${tier[0].toUpperCase()}${tier.slice(1)} Contributor role on the Strapi Discord server, once you connect your Discord account.`,
  })),
] as const;

export async function seedTierBenefits(strapi: Core.Strapi): Promise<void> {
  const existing = await strapi
    .documents("plugin::contributions.tier-benefit")
    .count({});
  if (existing > 0) return;

  for (const [sort, seed] of seeds.entries()) {
    await strapi
      .documents("plugin::contributions.tier-benefit")
      .create({ data: { ...seed, sort } });
  }

  strapi.log.info(`[seed] Created ${seeds.length} contributor tier benefits`);
}

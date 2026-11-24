/**
 * Mirrors the CMS's contributor tiers
 * (apps/cms/src/plugins/contributions/server/src/utils/contributor-tiers.ts) — keys
 * and thresholds must match; labels and colors are display-only. A user's
 * `contributor_tier` and `contribution_score` are computed and stored by
 * the CMS; the web app only displays them.
 */

/**
 * The seeded "Contributor tiers" help page
 * (apps/cms/src/plugins/contributions/server/src/seed/help-pages.ts).
 */
export const CONTRIBUTOR_TIERS_HELP_URL = "/help/contributor-tiers";

export const CONTRIBUTOR_TIERS = [
  {
    key: "bronze",
    label: "Bronze Contributor",
    shortLabel: "Bronze",
    minScore: 1,
    className: "border-orange-300 bg-orange-50 text-orange-800",
  },
  {
    key: "silver",
    label: "Silver Contributor",
    shortLabel: "Silver",
    minScore: 20,
    className: "border-slate-300 bg-slate-100 text-slate-700",
  },
  {
    key: "gold",
    label: "Gold Contributor",
    shortLabel: "Gold",
    minScore: 50,
    className: "border-amber-300 bg-amber-50 text-amber-800",
  },
  {
    key: "platinum",
    label: "Platinum Contributor",
    shortLabel: "Platinum",
    minScore: 100,
    className:
      "border-(--color-primary300) bg-(--color-primary100) text-(--color-primary700)",
  },
] as const;

export type ContributorTierKey = (typeof CONTRIBUTOR_TIERS)[number]["key"];
export type ContributorTierConfig = (typeof CONTRIBUTOR_TIERS)[number];

export function getContributorTierConfig(
  key: string | null | undefined,
): ContributorTierConfig | undefined {
  return CONTRIBUTOR_TIERS.find((tier) => tier.key === key);
}

/** The tier after `key` (the first tier when `key` is empty), if any. */
export function getNextContributorTier(
  key: string | null | undefined,
): ContributorTierConfig | undefined {
  const index = CONTRIBUTOR_TIERS.findIndex((tier) => tier.key === key);
  return CONTRIBUTOR_TIERS[index + 1];
}

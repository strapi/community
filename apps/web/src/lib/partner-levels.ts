/**
 * Partner-level badge colors, shared by the partners search overview
 * (features/search/indexes/partners) and the organization profile header
 * so the two stay visually in sync. Mirrors the `partner_level` enum on
 * `plugin::better-auth.organization`.
 */
export type PartnerLevel = "Enterprise" | "Business" | "Community";

type BadgeColors = {
  badgeColor: string;
  badgeTextColor: string;
};

export const getPartnerBadgeColors = (
  level?: string | null,
): BadgeColors | null => {
  switch (level) {
    case "Enterprise":
      return {
        badgeColor: "bg-(--color-warning100)",
        badgeTextColor: "text-(--color-warning700)",
      };
    case "Business":
      return {
        badgeColor: "bg-(--color-primary200)",
        badgeTextColor: "text-(--color-primary700)",
      };
    case "Community":
      return {
        badgeColor: "bg-(--color-success100)",
        badgeTextColor: "text-(--color-success700)",
      };
    default:
      return null;
  }
};

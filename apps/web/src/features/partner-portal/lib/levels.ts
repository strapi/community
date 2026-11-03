/**
 * Partner levels, lowest first. An organization's `partner_level` is one
 * of the last three; an empty level means "Unlisted".
 *
 * Mirrored from apps/cms/src/extensions/better-auth/utils/partner-levels.ts,
 * which is what actually filters the gated content — the rules here only
 * decide which locked states to show. Keep the two in sync.
 */
export const PARTNER_LEVELS = [
  "Unlisted",
  "Community",
  "Business",
  "Enterprise",
] as const;

export type PartnerLevel = (typeof PARTNER_LEVELS)[number];

export type PartnerSection =
  | "sales_enablement"
  | "tech_enablement"
  | "reusable_content";

export const SECTION_MINIMUM_LEVEL: Record<PartnerSection, PartnerLevel> = {
  sales_enablement: "Unlisted",
  tech_enablement: "Unlisted",
  reusable_content: "Unlisted",
};

/** What partners see: "Unlisted" stays the CMS value but is shown as "Registered". */
export const LEVEL_LABELS: Record<PartnerLevel, string> = {
  Unlisted: "Registered",
  Community: "Community",
  Business: "Business",
  Enterprise: "Enterprise",
};

export function meetsLevel(level: PartnerLevel, minimum: PartnerLevel) {
  return PARTNER_LEVELS.indexOf(level) >= PARTNER_LEVELS.indexOf(minimum);
}

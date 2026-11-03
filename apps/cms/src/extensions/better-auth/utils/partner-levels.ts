/**
 * Partner levels, lowest first. An organization's `partner_level` is one
 * of the last three; an empty level means "Registered".
 *
 * Mirrored in apps/web/src/features/partner-portal/lib/levels.ts — keep
 * the two in sync.
 */
export const PARTNER_LEVELS = [
  "Registered",
  "Community",
  "Business",
  "Enterprise",
] as const;

export type PartnerLevel = (typeof PARTNER_LEVELS)[number];

export type PartnerSection =
  | "sales_enablement"
  | "tech_enablement"
  | "reusable_content";

/** The lowest level that can see a section at all, on top of each resource's own `minimum_level`. */
export const SECTION_MINIMUM_LEVEL: Record<PartnerSection, PartnerLevel> = {
  sales_enablement: "Registered",
  tech_enablement: "Registered",
  reusable_content: "Registered",
};

/** Every level at or below `level` — i.e. the minimum levels it satisfies. */
export function levelsUpTo(level: PartnerLevel): PartnerLevel[] {
  return PARTNER_LEVELS.slice(0, PARTNER_LEVELS.indexOf(level) + 1);
}

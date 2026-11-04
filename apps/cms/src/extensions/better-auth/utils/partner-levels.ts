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

/**
 * Organizations with partner portal access: partners, plus an optional test
 * organization (`PARTNER_PORTAL_TEST_ORGANIZATION_ID`). The latter is for the
 * Strapi team's own organization, which isn't a partner but whose members
 * test the portal on production. Its `partner_level` still applies (empty
 * means "Registered"), so other levels can be previewed without flagging it
 * as a partner.
 *
 * Matched by `id` rather than `slug`: any user can create an organization or
 * change its slug, so a slug could be claimed by someone else once it's free.
 */
export function partnerPortalFilters() {
  const testOrganizationId = Number(
    process.env.PARTNER_PORTAL_TEST_ORGANIZATION_ID,
  );
  if (!Number.isInteger(testOrganizationId) || testOrganizationId <= 0) {
    return { partner: { $eq: true } };
  }

  return {
    $or: [{ partner: { $eq: true } }, { id: { $eq: testOrganizationId } }],
  };
}

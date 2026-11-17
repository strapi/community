/** Org roles that may impersonate (owner/admin — i.e. `organization: ["update"]`). */
const IMPERSONATION_ADMIN_ROLES = new Set(["owner", "admin"]);

/**
 * The user ids Better Auth's admin plugin treats as admins (`adminUserIds`),
 * derived from the owner/admin members of `IMPERSONATION_ORGANIZATION_ID` —
 * the Strapi team's own org, the same env-var-by-org-id pattern the partner
 * portal uses (`PARTNER_PORTAL_TEST_ORGANIZATION_ID`). The plugin captures
 * this exact array reference at init (see `admin()` in `auth.ts`) and reads it
 * on every request, so `refreshImpersonationAdmins` keeps it current by
 * replacing its *contents* in place (never reassigning). Empty — hence
 * impersonation disabled — until seeded at bootstrap (`src/index.ts`) and
 * whenever org membership changes (the org member hooks in `auth.ts`).
 */
export const impersonationAdminUserIds: string[] = [];

/**
 * Recomputes `impersonationAdminUserIds` from the current owner/admin members
 * of `IMPERSONATION_ORGANIZATION_ID`. A no-op that clears the list when the
 * env var is unset, so the feature is dormant until configured.
 */
export async function refreshImpersonationAdmins(): Promise<void> {
  const organizationId = Number(process.env.IMPERSONATION_ORGANIZATION_ID);

  const ids: string[] = [];
  if (Number.isInteger(organizationId) && organizationId > 0) {
    const members: { userId: number | string; role: string | null }[] =
      await strapi.db.query("plugin::better-auth.member").findMany({
        where: { organizationId },
        select: ["userId", "role"],
        limit: 10000,
      });

    for (const member of members) {
      const roles = (member.role ?? "").split(",").map((role) => role.trim());
      if (!roles.some((role) => IMPERSONATION_ADMIN_ROLES.has(role))) continue;
      // The strapi adapter returns numeric ids, but the admin plugin matches
      // `adminUserIds` against `session.user.id` with a strict `includes`, and
      // the id's runtime type is unreliable across this stack (every id
      // comparison in the codebase goes through `String()`). Store both forms
      // so the match holds whichever type the session carries.
      ids.push(String(member.userId), member.userId as unknown as string);
    }
  }

  impersonationAdminUserIds.splice(0, impersonationAdminUserIds.length, ...ids);
}

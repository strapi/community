import type { Core } from "@strapi/strapi";

const MEMBER_UID = "plugin::better-auth.member";

export type EmployeeStatus = "current" | "former" | null;

/**
 * The Strapi team's own organization (`IMPERSONATION_ORGANIZATION_ID`,
 * its numeric `id`), or `null` when unset — an unconfigured environment
 * then simply has no employees.
 */
function strapiOrganizationId(): number | null {
  const id = Number(process.env.IMPERSONATION_ORGANIZATION_ID);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * Who works, or worked, at Strapi — employees are excluded from
 * contributor tiers (they celebrate the community's contributions).
 *
 * Being a current employee isn't stored: it's membership (any role) of
 * the Strapi team's organization. Having *been* one can't be derived, so
 * it's the user's `former_strapi_employee` flag — set automatically when
 * someone is removed from that organization (see `onMembersRemoved`,
 * wired up in the plugin's `bootstrap`), or by hand in the better-auth
 * dashboard for people who left before this existed.
 */
export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async isCurrent(userId: string | number): Promise<boolean> {
    const organizationId = strapiOrganizationId();
    if (!organizationId) return false;

    const count = await strapi.db.query(MEMBER_UID).count({
      where: { organizationId, userId: Number(userId) },
    });
    return count > 0;
  },

  async getStatus(userId: string | number): Promise<EmployeeStatus> {
    if (await this.isCurrent(userId)) return "current";

    const user = await strapi.db.query("plugin::better-auth.user").findOne({
      where: { id: Number(userId) },
      select: ["former_strapi_employee"],
    });
    return user?.former_strapi_employee ? "former" : null;
  },

  /**
   * Called with the `member` rows that were just deleted: anyone who's no
   * longer in the Strapi team's organization becomes a former employee,
   * and loses any tier in the same write — so leaving Strapi never turns
   * years of work as an employee into a contributor tier.
   */
  async onMembersRemoved(
    members: { userId?: number | string | null; organizationId?: unknown }[],
  ) {
    const organizationId = strapiOrganizationId();
    if (!organizationId) return;

    const userIds = new Set(
      members
        .filter(
          (member) =>
            Number(member.organizationId) === organizationId && member.userId,
        )
        .map((member) => Number(member.userId)),
    );

    for (const userId of userIds) {
      // Still a member (e.g. a duplicate row was removed) — nothing changed.
      if (await this.isCurrent(userId)) continue;

      const [user] = await strapi
        .documents("plugin::better-auth.user")
        .findMany({ filters: { id: userId }, fields: ["documentId"] });
      if (!user) continue;

      // Through the document service, so the search index follows.
      await strapi.documents("plugin::better-auth.user").update({
        documentId: user.documentId,
        data: {
          former_strapi_employee: true,
          contributor_tier: null,
          contribution_score: 0,
          contribution_stats: null,
        },
      });
      strapi.log.info(
        `[contributions] User ${userId} left the Strapi team organization — marked as a former employee.`,
      );
    }
  },
});

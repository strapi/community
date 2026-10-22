/**
 * is-organization-member policy
 *
 * Requires the caller to be *any* member of the organization identified by
 * `ctx.params.id` — owner, admin, or plain member. For read-only org
 * routes (e.g. the "Submissions" list) where every member should see the
 * org's content, unlike `is-organization-owner` (owner/admin only, for
 * actions that actually change something).
 *
 * Must run after `is-authenticated`.
 *
 * Rejects by *throwing* `errors.ForbiddenError`, not by calling
 * `ctx.forbidden()` — see `is-authenticated.ts`'s comment for why that
 * Koa convenience method doesn't exist on a policy's `ctx`.
 */

import { errors } from "@strapi/utils";
import { isOrganizationMember } from "../utils";

export default async function isOrganizationMemberPolicy(ctx) {
  const { id: organizationId } = ctx.params;
  const session = ctx.state.betterAuthSession;

  const allowed = await isOrganizationMember(session.user.id, organizationId);

  if (!allowed) throw new errors.ForbiddenError();

  return true;
}

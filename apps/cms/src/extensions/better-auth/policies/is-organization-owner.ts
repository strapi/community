/**
 * is-organization-owner policy
 *
 * Requires the caller to be an owner or admin of the organization
 * identified by `ctx.params.id` — i.e. anyone better-auth's organization
 * plugin grants `organization: ["update"]` to by default (owner + admin,
 * not plain member). Delegates to `hasOrganizationUpdatePermission`
 * (which wraps the real `hasPermission` API defensively — see its own
 * comment) instead of hand-rolling role checks, so this stays correct if
 * custom roles or statements are ever configured in `lib/auth.ts`.
 *
 * Must run after `is-authenticated` so an unauthenticated request gets a
 * 401 from that policy rather than a 403 from this one.
 *
 * Rejects by *throwing* `errors.ForbiddenError`, not by calling
 * `ctx.forbidden()` — see `is-authenticated.ts`'s comment for why that
 * Koa convenience method doesn't exist on a policy's `ctx`.
 */

import { errors } from "@strapi/utils";
import { fromNodeHeaders } from "better-auth/node";
import { hasOrganizationUpdatePermission } from "../utils";

export default async function isOrganizationOwner(ctx) {
  const { id: organizationId } = ctx.params;

  const allowed = await hasOrganizationUpdatePermission(
    fromNodeHeaders(ctx.request.headers),
    organizationId,
  );

  if (!allowed) throw new errors.ForbiddenError();

  return true;
}

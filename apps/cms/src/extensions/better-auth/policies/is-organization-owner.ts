/**
 * is-organization-owner policy
 *
 * Requires the caller to be an owner or admin of the organization
 * identified by `ctx.params.id` — i.e. anyone better-auth's organization
 * plugin grants `organization: ["update"]` to by default (owner + admin,
 * not plain member). Delegates to the real `hasPermission` API instead of
 * hand-rolling role checks, so this stays correct if custom roles or
 * statements are ever configured in `lib/auth.ts`.
 *
 * Must run after `is-authenticated` so an unauthenticated request gets a
 * 401 from that policy rather than a 403 from this one.
 */

import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../../lib/auth";

export default async function isOrganizationOwner(ctx) {
  const { id: organizationId } = ctx.params;

  const { success } = await auth.api.hasPermission({
    headers: fromNodeHeaders(ctx.request.headers),
    body: {
      organizationId,
      permissions: { organization: ["update"] },
    },
  });

  if (!success) return ctx.forbidden();

  return true;
}

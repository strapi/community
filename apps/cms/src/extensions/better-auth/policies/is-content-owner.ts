/**
 * is-content-owner policy
 *
 * Requires the caller to be the *owner* of the package/template identified
 * by `ctx.params.documentId` (or `ctx.params.id`, for routes that reuse the
 * core `update` action's param name) — the account itself for a user-owned
 * entry, or an owner/admin of the owning organization for an org-owned one
 * (delegated to the same `hasPermission` call `is-organization-owner` uses,
 * so it stays correct if custom roles/statements are ever configured).
 *
 * Deliberately excludes maintainers: only the owner may edit, transfer, or
 * delete a submission — maintainers get read visibility only. That's
 * enforced here, server-side, not just by disabling the form client-side.
 * A maintainer of org-owned content who isn't themselves a member of that
 * org is a real, expected case here (not an error) — handled via
 * `hasOrganizationUpdatePermission`, which resolves to `false` rather
 * than throwing for it (see that function's own comment).
 *
 * Must run after `is-authenticated`. Route config:
 * `{ name: "plugin::better-auth.is-content-owner", config: { uid: "api::package.package" } }`
 * — the content type has to come from route config since one policy
 * serves both `api::package.package` and `api::template.template`.
 *
 * On success, stashes the resolved entry on `ctx.state.contentEntry` so the
 * controller action doesn't need to refetch it.
 *
 * Rejects by *throwing* the matching `@strapi/utils` error class, not by
 * calling `ctx.badRequest()`/`.notFound()`/`.forbidden()` — see
 * `is-authenticated.ts`'s comment for why those Koa convenience methods
 * don't exist on a policy's `ctx`.
 */

import type { UID } from "@strapi/strapi";
import { errors } from "@strapi/utils";
import { fromNodeHeaders } from "better-auth/node";
import { hasOrganizationUpdatePermission } from "../utils";
import { findContentOwner } from "../utils/cascade-delete";

export default async function isContentOwner(
  ctx,
  config: { uid: UID.ContentType },
) {
  const documentId: string | undefined = ctx.params.documentId ?? ctx.params.id;
  if (!documentId) throw new errors.ValidationError("Missing content id.");

  const entry = await strapi.documents(config.uid).findOne({
    documentId,
    status: "draft",
  });
  if (!entry) throw new errors.NotFoundError();

  ctx.state.contentEntry = entry;

  const owner = await findContentOwner(config.uid, documentId);
  if (!owner) throw new errors.ForbiddenError();

  const session = ctx.state.betterAuthSession;

  if (owner.type === "plugin::better-auth.user") {
    if (String(owner.id) === String(session.user.id)) return true;
    throw new errors.ForbiddenError();
  }

  if (owner.type === "plugin::better-auth.organization") {
    const allowed = await hasOrganizationUpdatePermission(
      fromNodeHeaders(ctx.request.headers),
      String(owner.id),
    );
    if (allowed) return true;
  }

  throw new errors.ForbiddenError();
}

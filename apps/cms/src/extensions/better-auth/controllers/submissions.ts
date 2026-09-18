/**
 * submissions controller — backs the web app's "Submissions" settings tab.
 */

import type { UID } from "@strapi/strapi";
import { fromNodeHeaders } from "better-auth/node";
import {
  findContentOwner,
  getPluginService,
  hasOrganizationUpdatePermission,
  isOrganizationMember,
  type OwnerType,
  sanitizeIfSvg,
} from "../utils";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

type ContentEntry = Record<string, unknown> & {
  id: number;
  documentId: string;
};

type PopulatedEntry = ContentEntry & {
  maintainers?: { id: number }[] | null;
};

/**
 * Shared by `getSubmission` and `canEdit`: is the caller the owner of an
 * entry with this `owner`? User-owned → the account itself; org-owned →
 * any owner/admin of that org, via `hasOrganizationUpdatePermission`
 * (same call `is-content-owner`/`is-organization-owner` use — including
 * its defensive handling of a caller who has no membership in the org at
 * all, e.g. a maintainer of org-owned content who isn't themselves a
 * member of that org: a real case, not an error). Deliberately excludes
 * maintainers — only the owner may edit, per the confirmed product
 * decision; maintainers get read visibility elsewhere, never this.
 */
async function resolveIsOwner(
  ctx,
  owner: { id: number; type: OwnerType } | null,
): Promise<boolean> {
  if (!owner) return false;
  const session = ctx.state.betterAuthSession;

  if (owner.type === "plugin::better-auth.user") {
    return String(owner.id) === String(session.user.id);
  }

  return hasOrganizationUpdatePermission(
    fromNodeHeaders(ctx.request.headers),
    String(owner.id),
  );
}

/**
 * Shared by `getPackage`/`getTemplate`: the single-item read behind the
 * edit form. Unlike every write action here, this is deliberately visible
 * to more than just the owner (read-only): a maintainer, so they can see
 * the submission's current state in their own `/account/submissions`,
 * and — for org-owned content — any member of the owning org, so clicking
 * "View" from the org's "Submissions" list works for every member, not
 * just an owner/admin. Only the owner can actually save changes
 * (enforced separately by `is-content-owner` on the write routes).
 */
async function getSubmission(
  ctx,
  uid: UID.ContentType,
  populate: Record<string, unknown>,
) {
  const session = ctx.state.betterAuthSession;
  const { documentId } = ctx.params;

  const entry = (await strapi.documents(uid).findOne({
    documentId,
    status: "draft",
    populate,
  })) as PopulatedEntry | null;
  if (!entry) return ctx.notFound();

  const owner = await findContentOwner(uid, documentId);
  if (!owner) return ctx.forbidden();

  const isOwner = await resolveIsOwner(ctx, owner);

  const isMaintainer = (entry.maintainers ?? []).some(
    (maintainer) => String(maintainer.id) === String(session.user.id),
  );

  const isFellowOrgMember =
    owner.type === "plugin::better-auth.organization" &&
    (await isOrganizationMember(session.user.id, owner.id));

  if (!isOwner && !isMaintainer && !isFellowOrgMember) {
    return ctx.forbidden();
  }

  // Link to the live public page, if there is one — a submission still
  // awaiting its first moderation approval has no published version (and
  // no page) yet. `url_alias` is set by strapi-plugin-webtools and is the
  // only reliable source for this path (see every other package/template
  // link in the web app — none of them hand-build the URL).
  // `url_alias` only type-checks against a literal draftAndPublish uid —
  // `uid` here is the broader `UID.ContentType` union, but at runtime
  // it's always one of the two content types below, both of which have it.
  const published = (await strapi
    .documents(uid as "api::package.package" | "api::template.template")
    .findOne({
      documentId,
      status: "published",
      fields: ["documentId"],
      populate: { url_alias: { fields: ["url_path"] } },
    })) as { url_alias?: { url_path?: string | null }[] | null } | null;
  const url = published?.url_alias?.[0]?.url_path ?? null;

  ctx.body = { ...entry, isOwner, url };
}

/**
 * Shared by `canEditPackage`/`canEditTemplate` — backs the "Edit" button
 * shown on the public package/template page. Deliberately much cheaper
 * than `getSubmission`: no relations/readme populated, just the owner
 * check, since this is called on every page load for a logged-in viewer
 * (the web app only calls it when it already knows a session exists — see
 * `apps/web/src/features/submissions/lib/can-edit.ts` — but this action
 * itself still requires `is-authenticated`, so an anonymous request never
 * reaches it at all). Answers `{ canEdit: false }` for a logged-in
 * non-owner (maintainers included — only the owner may edit) rather than
 * 403ing: anyone signed in may ask, the answer is what's gated.
 *
 * Also reports which settings context the edit link should point at —
 * `/account/submissions/...` for a user-owned entry, or
 * `/org/<ownerSlug>/submissions/...` for an org-owned one, since the edit
 * form lives inside whichever settings shell the caller reaches it
 * through (see account-view.tsx / organization-view.tsx).
 */
async function canEdit(ctx, uid: UID.ContentType) {
  const { documentId } = ctx.params;
  const owner = await findContentOwner(uid, documentId);
  const isOwner = await resolveIsOwner(ctx, owner);

  let ownerSlug: string | null = null;
  if (isOwner && owner?.type === "plugin::better-auth.organization") {
    const [organization] = await strapi
      .documents("plugin::better-auth.organization")
      .findMany({
        filters: { id: owner.id },
        fields: ["slug"],
        pagination: { pageSize: 1 },
      });
    ownerSlug = organization?.slug ?? null;
  }

  ctx.body = { canEdit: isOwner, ownerType: owner?.type ?? null, ownerSlug };
}

/**
 * Shared by `uploadPackageIcon`/`uploadTemplatePreviewImage`: uploads a
 * replacement image, points `field` at it, deletes whatever it replaced,
 * and republishes immediately if the entry was already live — same
 * reasoning as the package/template controllers' `update` override.
 */
async function uploadImage(
  ctx,
  uid: UID.ContentType,
  field: "icon" | "preview_image",
) {
  const entry = ctx.state.contentEntry as ContentEntry;

  const uploaded = ctx.request.files?.file;
  const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;
  if (!file) return ctx.badRequest("No file provided.");
  if (!file.mimetype?.startsWith("image/")) {
    return ctx.badRequest("Image must be an image file.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return ctx.badRequest("Image must be smaller than 5 MB.");
  }

  await sanitizeIfSvg(file);

  const previous = await strapi.documents(uid).findOne({
    documentId: entry.documentId,
    status: "draft",
    populate: { [field]: { fields: ["id"] } },
  });
  const previousFile = (
    previous as unknown as Record<string, { id: number } | null>
  )?.[field];

  const [uploadedFile] = await strapi
    .plugin("upload")
    .service("upload")
    .upload({
      data: { fileInfo: { name: `${field}-${entry.documentId}` } },
      files: file,
    });

  await strapi.documents(uid).update({
    status: "draft",
    documentId: entry.documentId,
    data: { [field]: uploadedFile.id },
  });

  if (previousFile?.id) {
    const old = await strapi.db
      .query("plugin::upload.file")
      .findOne({ where: { id: previousFile.id } });
    if (old) await strapi.plugin("upload").service("upload").remove(old);
  }

  const published = await strapi.documents(uid).findOne({
    documentId: entry.documentId,
    status: "published",
    fields: ["documentId"],
  });
  if (published) {
    // `.publish()` only type-checks against a literal draftAndPublish uid —
    // `uid` here is the broader `UID.ContentType` union, but at runtime
    // it's always one of the two content types below.
    await strapi
      .documents(uid as "api::package.package" | "api::template.template")
      .publish({ documentId: entry.documentId });
  }

  ctx.body = { url: uploadedFile.url };
}

/** Shared by `transferPackage`/`transferTemplate`. */
async function transferContent(ctx, uid: UID.ContentType) {
  const { documentId } = ctx.params;
  const { ownerDocumentId, ownerType } = (ctx.request.body ?? {}) as {
    ownerDocumentId?: string;
    ownerType?: string;
  };

  if (!ownerDocumentId || !ownerType) {
    return ctx.badRequest("ownerDocumentId and ownerType are required.");
  }
  if (
    ownerType !== "plugin::better-auth.user" &&
    ownerType !== "plugin::better-auth.organization"
  ) {
    return ctx.badRequest("Invalid ownerType.");
  }

  try {
    const owner = await getPluginService("submissions").transferOwnership({
      uid,
      documentId,
      ownerDocumentId,
      ownerType,
    });
    ctx.body = { success: true, owner };
  } catch (err) {
    return ctx.badRequest((err as Error).message);
  }
}

export default () => ({
  /**
   * GET /users/me/submissions — the web app's personal "Submissions" tab.
   * Gated by `is-authenticated` only; ownership isn't checked per-row here
   * since the listing is inherently scoped to the caller's own id.
   */
  async mine(ctx) {
    const session = ctx.state.betterAuthSession;
    ctx.body = await getPluginService("submissions").getUserSubmissions(
      session.user.id,
    );
  },

  /**
   * GET /organizations/:id/submissions — the web app's organization
   * "Submissions" tab. Gated by `is-authenticated` + `is-organization-member`
   * — any member can see the list, but only an owner/admin can edit, so
   * `isOwner` is computed once for the caller here and applied uniformly
   * to every row (org-level, unlike the personal list where it varies
   * per-item by who maintains what).
   */
  async organizationMine(ctx) {
    const { id } = ctx.params;

    const isOwner = await hasOrganizationUpdatePermission(
      fromNodeHeaders(ctx.request.headers),
      id,
    );
    const result =
      await getPluginService("submissions").getOrganizationSubmissions(id);

    ctx.body = {
      packages: result.packages.map((entry) => ({ ...entry, isOwner })),
      templates: result.templates.map((entry) => ({ ...entry, isOwner })),
    };
  },

  /**
   * GET /user-by-slug?slug= — backs the maintainer picker and the
   * transfer "new owner" picker on the edit form. An exact, single-result
   * lookup (not a search-as-you-type) — the slug is already public (a
   * user's profile URL), so this reveals nothing new, unlike a
   * name/email search would. Deliberately not nested under `/users/` —
   * that prefix is already claimed by the public `GET /users/:id` route,
   * and a sibling static path there would depend on fragile
   * route-registration ordering to avoid `:id` swallowing it first.
   */
  async findUserBySlug(ctx) {
    const slug = typeof ctx.query.slug === "string" ? ctx.query.slug : "";
    const user = await getPluginService("submissions").findUserBySlug(slug);
    ctx.body = { data: user };
  },

  /**
   * GET /organization-by-slug?slug= — backs the transfer "new owner"
   * picker when transferring to an organization. Same reasoning as
   * `findUserBySlug` above.
   */
  async findOrganizationBySlug(ctx) {
    const slug = typeof ctx.query.slug === "string" ? ctx.query.slug : "";
    const organization =
      await getPluginService("submissions").findOrganizationBySlug(slug);
    ctx.body = { data: organization };
  },

  /** GET /packages/:documentId/submission — the edit form's data source. */
  async getPackage(ctx) {
    return getSubmission(ctx, "api::package.package", {
      categories: true,
      maintainers: { fields: ["documentId", "name", "email", "image"] },
      icon: true,
    });
  },

  /** GET /templates/:documentId/submission — the edit form's data source. */
  async getTemplate(ctx) {
    return getSubmission(ctx, "api::template.template", {
      categories: true,
      maintainers: { fields: ["documentId", "name", "email", "image"] },
      preview_image: true,
    });
  },

  /** GET /packages/:documentId/can-edit — backs the public page's "Edit" button. */
  async canEditPackage(ctx) {
    return canEdit(ctx, "api::package.package");
  },

  /** GET /templates/:documentId/can-edit — backs the public page's "Edit" button. */
  async canEditTemplate(ctx) {
    return canEdit(ctx, "api::template.template");
  },

  /** POST /packages/:documentId/icon */
  async uploadPackageIcon(ctx) {
    return uploadImage(ctx, "api::package.package", "icon");
  },

  /** POST /templates/:documentId/preview-image */
  async uploadTemplatePreviewImage(ctx) {
    return uploadImage(ctx, "api::template.template", "preview_image");
  },

  /** POST /packages/:documentId/transfer */
  async transferPackage(ctx) {
    return transferContent(ctx, "api::package.package");
  },

  /** POST /templates/:documentId/transfer */
  async transferTemplate(ctx) {
    return transferContent(ctx, "api::template.template");
  },

  /** DELETE /packages/:documentId/submission */
  async deletePackage(ctx) {
    const { documentId } = ctx.params;
    await getPluginService("submissions").deleteSubmission(
      "api::package.package",
      documentId,
    );
    ctx.body = { success: true };
  },

  /** DELETE /templates/:documentId/submission */
  async deleteTemplate(ctx) {
    const { documentId } = ctx.params;
    await getPluginService("submissions").deleteSubmission(
      "api::template.template",
      documentId,
    );
    ctx.body = { success: true };
  },
});

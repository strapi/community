/**
 * submissions service — backs the web app's "Submissions" settings tab
 * (list/transfer/delete of packages & templates a user or organization
 * owns; plain field edits go through the core package/template `update`
 * routes instead — see their controller overrides).
 */

import type { UID } from "@strapi/strapi";
import {
  deleteSingleOwnedPackage,
  deleteSingleOwnedTemplate,
  findOwnedContentIds,
  type OwnerType,
} from "../utils";

const PACKAGE_UID: UID.ContentType = "api::package.package";
const TEMPLATE_UID: UID.ContentType = "api::template.template";

/** The list view's thumbnail — `icon` for packages, `preview_image` for templates. */
function imagePopulate(uid: UID.ContentType): Record<string, unknown> {
  return uid === PACKAGE_UID ? { icon: true } : { preview_image: true };
}

type SubmissionRow = Record<string, unknown> & { isOwner: boolean };

async function findRowsByIds(uid: UID.ContentType, ids: number[]) {
  if (!ids.length) return [];
  return strapi.documents(uid).findMany({
    status: "draft",
    filters: { id: { $in: ids } },
    populate: imagePopulate(uid),
  });
}

/**
 * Merges a user's owned + maintained rows for one content type into a
 * single deduplicated list, each tagged `isOwner` so the web app can grey
 * out edit affordances for rows the caller only maintains.
 */
function mergeOwnedAndMaintained(
  ownedIds: number[],
  owned: Awaited<ReturnType<typeof findRowsByIds>>,
  maintained: Awaited<ReturnType<typeof findRowsByIds>>,
): SubmissionRow[] {
  const ownedIdSet = new Set(ownedIds.map(String));
  const merged = new Map<string, SubmissionRow>();

  for (const entry of owned) {
    merged.set(entry.documentId, { ...entry, isOwner: true });
  }
  for (const entry of maintained) {
    if (merged.has(entry.documentId)) continue;
    merged.set(entry.documentId, {
      ...entry,
      isOwner: ownedIdSet.has(String(entry.id)),
    });
  }

  return Array.from(merged.values());
}

export default ({ strapi }) => ({
  /**
   * Everything a user owns, plus everything they merely maintain (which
   * may belong to someone else, including an organization) — maintainers
   * get read visibility in their own `/account/submissions`, never write
   * access (enforced by `is-content-owner`, not by this listing). Includes
   * drafts/unpublished submissions, unlike the public
   * `GET /users/:id/related-content` route.
   */
  async getUserSubmissions(userId: string | number) {
    const [ownedPackageIds, ownedTemplateIds] = await Promise.all([
      findOwnedContentIds(PACKAGE_UID, userId, "plugin::better-auth.user"),
      findOwnedContentIds(TEMPLATE_UID, userId, "plugin::better-auth.user"),
    ]);

    const [
      ownedPackages,
      ownedTemplates,
      maintainedPackages,
      maintainedTemplates,
    ] = await Promise.all([
      findRowsByIds(PACKAGE_UID, ownedPackageIds),
      findRowsByIds(TEMPLATE_UID, ownedTemplateIds),
      strapi.documents(PACKAGE_UID).findMany({
        status: "draft",
        filters: { maintainers: { id: { $eq: userId } } },
        populate: imagePopulate(PACKAGE_UID),
      }),
      strapi.documents(TEMPLATE_UID).findMany({
        status: "draft",
        filters: { maintainers: { id: { $eq: userId } } },
        populate: imagePopulate(TEMPLATE_UID),
      }),
    ]);

    return {
      packages: mergeOwnedAndMaintained(
        ownedPackageIds,
        ownedPackages,
        maintainedPackages,
      ),
      templates: mergeOwnedAndMaintained(
        ownedTemplateIds,
        ownedTemplates,
        maintainedTemplates,
      ),
    };
  },

  /**
   * Everything an organization owns. Whether the *caller* may edit it
   * (org owner/admin vs. a plain member just viewing) isn't a per-row
   * property here — the controller tags every row with the same
   * `isOwner` after this returns (see `organizationMine` in
   * `controllers/submissions.ts`), since it depends on the caller's own
   * role in this one org, not on anything per-package/template.
   */
  async getOrganizationSubmissions(organizationId: string | number) {
    const [packageIds, templateIds] = await Promise.all([
      findOwnedContentIds(
        PACKAGE_UID,
        organizationId,
        "plugin::better-auth.organization",
      ),
      findOwnedContentIds(
        TEMPLATE_UID,
        organizationId,
        "plugin::better-auth.organization",
      ),
    ]);

    const [packages, templates] = await Promise.all([
      findRowsByIds(PACKAGE_UID, packageIds),
      findRowsByIds(TEMPLATE_UID, templateIds),
    ]);

    return { packages, templates };
  },

  /**
   * Moves `owner` to a new user/organization, immediately (no acceptance
   * flow, per product decision) — same relation shape the admin
   * `owner-selector` plugin's `setOwner` action writes, but reachable from
   * the content API and gated by `is-content-owner` rather than being
   * admin-only.
   *
   * Updates the draft row unconditionally, and the published row too if
   * one already exists — otherwise a still-unapproved submission's owner
   * would only "take" once it's first published, and a previously
   * transferred, already-live submission would keep showing its old owner
   * publicly until its next edit.
   */
  async transferOwnership({
    uid,
    documentId,
    ownerDocumentId,
    ownerType,
  }: {
    uid: UID.ContentType;
    documentId: string;
    ownerDocumentId: string;
    ownerType: OwnerType;
  }) {
    const ownerEntity = await strapi.db
      .query(ownerType)
      .findOne({ where: { documentId: ownerDocumentId } });
    if (!ownerEntity) throw new Error("Owner not found");

    const data = { owner: { id: ownerEntity.id, __type: ownerType } };

    await strapi.documents(uid).update({ status: "draft", documentId, data });

    const published = await strapi
      .documents(uid)
      .findOne({ documentId, status: "published", fields: ["documentId"] });
    if (published) {
      await strapi
        .documents(uid)
        .update({ status: "published", documentId, data });
    }

    return ownerEntity;
  },

  /** Deletes one owned package/template — see `deleteSingleOwned{Package,Template}`. */
  async deleteSubmission(uid: UID.ContentType, documentId: string) {
    if (uid === PACKAGE_UID) return deleteSingleOwnedPackage(documentId);
    if (uid === TEMPLATE_UID) return deleteSingleOwnedTemplate(documentId);
    throw new Error(`Unsupported content type: ${uid}`);
  },

  /**
   * Backs both the maintainer picker and the transfer-target ("owner")
   * picker on the edit form — an exact, single-result lookup by slug
   * (never partial/prefix matching, and never matched on email/name), so
   * this can't be used to enumerate registered emails or search the user
   * base. A user's slug is already public (it's their profile URL), so
   * this reveals nothing a visitor to `/<slug>` couldn't already see.
   */
  async findUserBySlug(slug: string) {
    const trimmed = slug.trim();
    if (!trimmed) return null;

    const [user] = await strapi.documents("plugin::better-auth.user").findMany({
      filters: { slug: { $eq: trimmed } },
      fields: ["documentId", "name", "slug", "image"],
      pagination: { pageSize: 1 },
    });

    if (!user) return null;
    return {
      documentId: user.documentId,
      name: user.name,
      slug: user.slug,
      image: user.image ?? null,
    };
  },

  /** Same as `findUserBySlug`, for transferring to an organization instead of a user. */
  async findOrganizationBySlug(slug: string) {
    const trimmed = slug.trim();
    if (!trimmed) return null;

    const [organization] = await strapi
      .documents("plugin::better-auth.organization")
      .findMany({
        filters: { slug: { $eq: trimmed } },
        fields: ["documentId", "name", "slug", "logo"],
        pagination: { pageSize: 1 },
      });

    if (!organization) return null;
    return {
      documentId: organization.documentId,
      name: organization.name,
      slug: organization.slug,
      image: organization.logo ?? null,
    };
  },
});

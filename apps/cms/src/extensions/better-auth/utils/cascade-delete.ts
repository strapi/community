import type { UID } from "@strapi/strapi";
import { extractContentTypeName } from "./content-type-name";

type OwnerType =
  | "plugin::better-auth.user"
  | "plugin::better-auth.organization";

/**
 * Finds the raw ids of every entry of `uid` whose polymorphic `owner`
 * (`owner_type`/`owner_id` — a `morphToOne`, which Strapi's own query/document
 * services can't filter on directly) points at `ownerId`/`ownerType`. Shared
 * by the org/user services' own `getRelatedContent` and the cascade-delete
 * helpers below, so the raw lookup only lives in one place.
 */
export async function findOwnedContentIds(
  uid: UID.ContentType,
  ownerId: string | number,
  ownerType: OwnerType,
): Promise<number[]> {
  const contentTypeName = extractContentTypeName(uid);

  const rows: { id: number }[] = await strapi.db
    .connection(`${contentTypeName}s`)
    .select("id")
    .where({ owner_id: ownerId, owner_type: ownerType });

  return rows.map((row) => row.id);
}

/** Deletes a media file (looked up by id) via the upload plugin, if it exists. */
async function deleteMediaById(id: number) {
  const file = await strapi.db
    .query("plugin::upload.file")
    .findOne({ where: { id } });
  if (file) await strapi.plugin("upload").service("upload").remove(file);
}

/**
 * Deletes every package owned by a user/organization, along with what would
 * otherwise be left orphaned once it's gone: its business/security reviews,
 * its `url_alias` redirect entries, and its icon.
 */
async function deleteOwnedPackages(
  ownerId: string | number,
  ownerType: OwnerType,
) {
  const ids = await findOwnedContentIds(
    "api::package.package",
    ownerId,
    ownerType,
  );
  if (!ids.length) return;

  const entries = await strapi.documents("api::package.package").findMany({
    filters: { id: { $in: ids } },
    fields: ["documentId"],
    populate: {
      icon: { fields: ["id"] },
      business_review: { fields: ["documentId"] },
      security_reviews: { fields: ["documentId"] },
      url_alias: { fields: ["documentId"] },
    },
  });

  for (const entry of entries) {
    if (entry.business_review) {
      await strapi
        .documents("plugin::moderation.business-review")
        .delete({ documentId: entry.business_review.documentId });
    }

    for (const review of entry.security_reviews ?? []) {
      await strapi
        .documents("plugin::moderation.security-review")
        .delete({ documentId: review.documentId });
    }

    for (const alias of entry.url_alias ?? []) {
      await strapi
        .documents("plugin::webtools.url-alias")
        .delete({ documentId: alias.documentId });
    }

    if (entry.icon) await deleteMediaById(entry.icon.id);

    await strapi
      .documents("api::package.package")
      .delete({ documentId: entry.documentId });
  }
}

/** Same as `deleteOwnedPackages`, for templates (whose media field is `preview_image`). */
async function deleteOwnedTemplates(
  ownerId: string | number,
  ownerType: OwnerType,
) {
  const ids = await findOwnedContentIds(
    "api::template.template",
    ownerId,
    ownerType,
  );
  if (!ids.length) return;

  const entries = await strapi.documents("api::template.template").findMany({
    filters: { id: { $in: ids } },
    fields: ["documentId"],
    populate: {
      preview_image: { fields: ["id"] },
      business_review: { fields: ["documentId"] },
      security_reviews: { fields: ["documentId"] },
      url_alias: { fields: ["documentId"] },
    },
  });

  for (const entry of entries) {
    if (entry.business_review) {
      await strapi
        .documents("plugin::moderation.business-review")
        .delete({ documentId: entry.business_review.documentId });
    }

    for (const review of entry.security_reviews ?? []) {
      await strapi
        .documents("plugin::moderation.security-review")
        .delete({ documentId: review.documentId });
    }

    for (const alias of entry.url_alias ?? []) {
      await strapi
        .documents("plugin::webtools.url-alias")
        .delete({ documentId: alias.documentId });
    }

    if (entry.preview_image) await deleteMediaById(entry.preview_image.id);

    await strapi
      .documents("api::template.template")
      .delete({ documentId: entry.documentId });
  }
}

/**
 * Same idea, for showcases — no `business_review`/`security_reviews`/
 * `url_alias` on this content type (webtools is disabled for it), just the
 * entry and its `image`.
 */
async function deleteOwnedShowcases(
  ownerId: string | number,
  ownerType: OwnerType,
) {
  const ids = await findOwnedContentIds(
    "api::showcase.showcase",
    ownerId,
    ownerType,
  );
  if (!ids.length) return;

  const entries = await strapi.documents("api::showcase.showcase").findMany({
    filters: { id: { $in: ids } },
    fields: ["documentId"],
    populate: { image: { fields: ["id"] } },
  });

  for (const entry of entries) {
    if (entry.image) await deleteMediaById(entry.image.id);

    await strapi
      .documents("api::showcase.showcase")
      .delete({ documentId: entry.documentId });
  }
}

/**
 * Deletes every package/template/showcase owned by a user or organization,
 * along with everything that would otherwise be left orphaned once the
 * entry itself is gone. Used by both `cascadeDeleteOrganization` and
 * `cascadeDeleteUser`.
 */
export async function deleteOwnedContent({
  ownerId,
  ownerType,
}: {
  ownerId: string | number;
  ownerType: OwnerType;
}) {
  await deleteOwnedPackages(ownerId, ownerType);
  await deleteOwnedTemplates(ownerId, ownerType);
  await deleteOwnedShowcases(ownerId, ownerType);
}

/**
 * Deletes the `api::profile.profile` linked to a user (if any), their
 * avatar file, and their `url_alias` redirect entries. The avatar isn't a
 * `media` attribute — like `deleteOwnedFile` (`utils/index.ts`) already
 * relies on, it's tracked only by URL (`user.image`), looked up by that URL
 * on `plugin::upload.file`.
 */
export async function deleteUserProfileAndAvatar(userId: string | number) {
  const [user] = await strapi.documents("plugin::better-auth.user").findMany({
    filters: { id: userId },
    fields: ["documentId", "image"],
    populate: {
      profile: { fields: ["documentId"] },
      url_alias: { fields: ["documentId"] },
    },
  });
  if (!user) return;

  if (user.profile) {
    await strapi
      .documents("api::profile.profile")
      .delete({ documentId: user.profile.documentId });
  }

  for (const alias of user.url_alias ?? []) {
    await strapi
      .documents("plugin::webtools.url-alias")
      .delete({ documentId: alias.documentId });
  }

  if (user.image) {
    const file = await strapi.db
      .query("plugin::upload.file")
      .findOne({ where: { url: user.image } });
    if (file) await strapi.plugin("upload").service("upload").remove(file);
  }
}

/** Same as `deleteUserProfileAndAvatar`, for organizations (`logo` instead of `image`). */
export async function deleteOrganizationProfileAndLogo(
  organizationId: string | number,
) {
  const [organization] = await strapi
    .documents("plugin::better-auth.organization")
    .findMany({
      filters: { id: organizationId },
      fields: ["documentId", "logo"],
      populate: {
        profile: { fields: ["documentId"] },
        url_alias: { fields: ["documentId"] },
      },
    });
  if (!organization) return;

  if (organization.profile) {
    await strapi
      .documents("api::profile.profile")
      .delete({ documentId: organization.profile.documentId });
  }

  for (const alias of organization.url_alias ?? []) {
    await strapi
      .documents("plugin::webtools.url-alias")
      .delete({ documentId: alias.documentId });
  }

  if (organization.logo) {
    const file = await strapi.db
      .query("plugin::upload.file")
      .findOne({ where: { url: organization.logo } });
    if (file) await strapi.plugin("upload").service("upload").remove(file);
  }
}

/**
 * Removes `userId` from the `maintainers` list of any package/template they
 * don't own but still maintain — content itself is left untouched. Uses the
 * lower-level `strapi.db.query` (rather than the document service) since it
 * takes plain relation ids directly, mirroring `relinkOrganizationLogo`'s
 * own relation-array update in `lib/auth.ts`.
 */
async function stripMaintainer(userId: string | number) {
  for (const uid of [
    "api::package.package",
    "api::template.template",
  ] as const) {
    const entries: { id: number }[] = await strapi.db.query(uid).findMany({
      where: { maintainers: { id: userId } },
      select: ["id"],
    });

    for (const entry of entries) {
      await strapi.db.query(uid).update({
        where: { id: entry.id },
        data: { maintainers: { disconnect: [{ id: userId }] } },
      });
    }
  }
}

/**
 * Cascade-deletes everything an organization owns, ahead of the org itself
 * being deleted — hooked into `organizationHooks.beforeDeleteOrganization`
 * in `lib/auth.ts`. Deliberately does NOT delete the org's own `member`,
 * `invitation`, or `organization` rows: better-auth's own
 * `deleteOrganization` adapter method already does that immediately after
 * this hook runs (see `better-auth/plugins/organization/adapter.mjs`).
 */
export async function cascadeDeleteOrganization(
  organizationId: string | number,
) {
  await deleteOwnedContent({
    ownerId: organizationId,
    ownerType: "plugin::better-auth.organization",
  });

  await deleteOrganizationProfileAndLogo(organizationId);
}

/**
 * Cascade-deletes everything a user owns, ahead of the user itself being
 * deleted — hooked into `user.deleteUser.beforeDelete` in `lib/auth.ts`.
 * Unlike org deletion, better-auth's own `deleteUser` never touches
 * `member`/`invitation` rows at all, so this handles organization
 * membership itself too: any org the user owns is fully cascade-deleted
 * (its other members lose it — a deliberate product decision, no
 * ownership auto-transfer); any org they're just a member/admin of just
 * has their membership removed.
 */
export async function cascadeDeleteUser(userId: string | number) {
  await deleteOwnedContent({
    ownerId: userId,
    ownerType: "plugin::better-auth.user",
  });

  await deleteUserProfileAndAvatar(userId);

  const memberships = await strapi
    .documents("plugin::better-auth.member")
    .findMany({
      filters: { userId },
      fields: ["documentId", "organizationId", "role"],
    });

  for (const membership of memberships) {
    if (membership.role !== "owner") {
      await strapi
        .documents("plugin::better-auth.member")
        .delete({ documentId: membership.documentId });
      continue;
    }

    // Sole/co-owner leaving via account deletion — cascade-delete the
    // whole organization, replicating better-auth's own
    // `deleteOrganization` cleanup (member + invitation rows, then the
    // organization itself) since that endpoint is bypassed on this path.
    await cascadeDeleteOrganization(membership.organizationId);

    const [remainingMembers, invitations, [organization]] = await Promise.all([
      strapi.documents("plugin::better-auth.member").findMany({
        filters: { organizationId: membership.organizationId },
        fields: ["documentId"],
      }),
      strapi.documents("plugin::better-auth.invitation").findMany({
        filters: { organizationId: membership.organizationId },
        fields: ["documentId"],
      }),
      strapi.documents("plugin::better-auth.organization").findMany({
        filters: { id: membership.organizationId },
        fields: ["documentId"],
      }),
    ]);

    for (const member of remainingMembers) {
      await strapi
        .documents("plugin::better-auth.member")
        .delete({ documentId: member.documentId });
    }
    for (const invitation of invitations) {
      await strapi
        .documents("plugin::better-auth.invitation")
        .delete({ documentId: invitation.documentId });
    }
    if (organization) {
      await strapi
        .documents("plugin::better-auth.organization")
        .delete({ documentId: organization.documentId });
    }
  }

  await stripMaintainer(userId);
}

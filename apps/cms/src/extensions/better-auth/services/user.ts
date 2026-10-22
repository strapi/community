/**
 * user service
 */

import { factories, type Modules, type UID } from "@strapi/strapi";
import {
  deleteOwnedFile,
  findOwnedContentIds,
  uploadOwnedFile,
} from "../utils";

export default factories.createCoreService("plugin::better-auth.user", () => ({
  /** Uploads an avatar image to the media library, linked to its owning user. */
  async uploadAvatar({
    userId,
    file,
  }: {
    userId: string | number;
    file: unknown;
  }) {
    return uploadOwnedFile({
      userId,
      file,
      field: "avatar",
      name: `avatar-${userId}`,
    });
  },

  /**
   * Removes a previously uploaded avatar from the media library, but only
   * if it belongs to this user.
   */
  async deleteAvatar({
    userId,
    url,
    headers,
  }: {
    userId: string | number;
    url: string;
    headers: Headers;
  }) {
    return deleteOwnedFile({ userId, url, headers });
  },

  /**
   * Reads the `api::profile.profile` linked to a user, if any — used by
   * the web app's personal "Profile" tab.
   */
  async getProfile({ userId }: { userId: string | number }) {
    const [user] = await strapi.documents("plugin::better-auth.user").findMany({
      filters: { id: userId },
      fields: ["documentId"],
      populate: { profile: {} },
    });

    return user?.profile ?? null;
  },

  /**
   * Upserts the `api::profile.profile` linked to a user — mirrors the
   * organization service's `updateProfile`; most users won't have one
   * yet, since nothing creates it automatically when a user signs up.
   */
  async updateProfile({
    userId,
    data,
  }: {
    userId: string | number;
    data: Record<string, unknown>;
  }) {
    const [user] = await strapi.documents("plugin::better-auth.user").findMany({
      filters: { id: userId },
      fields: ["documentId"],
      populate: { profile: { fields: ["documentId"] } },
    });

    if (!user) return null;

    if (user.profile) {
      return strapi.documents("api::profile.profile").update({
        documentId: user.profile.documentId,
        data,
      });
    }

    const profile = await strapi.documents("api::profile.profile").create({
      data,
    });

    await strapi.documents("plugin::better-auth.user").update({
      documentId: user.documentId,
      data: { profile: profile.documentId },
    });

    return profile;
  },

  async getRelatedContent<UID extends UID.ContentType>({
    organizationId,
    uid,
    query,
  }: {
    organizationId: string;
    uid: UID;
    query?: Modules.Documents.ServiceParams<UID>["findMany"];
  }) {
    const IDs = await findOwnedContentIds(
      uid,
      organizationId,
      "plugin::better-auth.user",
    );

    const ownedItems = await strapi.documents(uid).findMany({
      ...query,
      filters: {
        ...query?.filters,
        id: {
          $in: IDs as Modules.Documents.Params.Attribute.ID[],
        },
      },
    });

    const maintainedItems = await strapi.documents(uid).findMany({
      ...query,
      filters: {
        ...query?.filters,
        maintainers: {
          // biome-ignore lint/suspicious/noTsIgnore: Weird situation where it only errors in the Strapi compiler.
          // @ts-ignore
          id: {
            $eq: organizationId,
          },
        },
      },
    });

    // Merge owned and maintained items, removing duplicates (in case of overlap)
    const mergedItemsMap = new Map<string | number, unknown>();
    [...ownedItems, ...maintainedItems].forEach((item) => {
      mergedItemsMap.set(item.id, item);
    });

    return Array.from(mergedItemsMap.values());
  },
}));

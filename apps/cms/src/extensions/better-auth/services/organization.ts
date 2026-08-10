/**
 * organization service
 */

import { factories, type Modules, type UID } from "@strapi/strapi";
import { extractContentTypeName } from "../utils";

const logoFileName = (userId: string | number) => `logo-${userId}`;

export default factories.createCoreService(
  "plugin::better-auth.organization",
  () => ({
    /**
     * Uploads a logo image to the media library, tagged by the uploading
     * user rather than a specific organization — better-auth-ui's
     * `organization.logo.upload` config has no way to pass which org the
     * logo is for (it's set on the org afterwards via better-auth's own
     * `organization.update`, which already enforces the
     * owner/admin-only `organization:update` permission for that org).
     */
    async uploadLogo({
      userId,
      file,
    }: {
      userId: string | number;
      file: unknown;
    }) {
      const [uploaded] = await strapi
        .plugin("upload")
        .service("upload")
        .upload({
          data: { fileInfo: { name: logoFileName(userId) } },
          files: file,
        });

      return uploaded as { url: string };
    },

    /**
     * Removes a previously uploaded logo from the media library, but only
     * if it was tagged as this user's own logo upload.
     */
    async deleteLogo({
      userId,
      url,
    }: {
      userId: string | number;
      url: string;
    }) {
      const existing = await strapi.db
        .query("plugin::upload.file")
        .findOne({ where: { url, name: logoFileName(userId) } });

      if (!existing) return false;

      await strapi.plugin("upload").service("upload").remove(existing);
      return true;
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
      const contentTypeName = extractContentTypeName(uid);

      const IDs: Record<string, unknown>[] = await strapi.db
        .connection(`${contentTypeName}s`)
        .select("id")
        .where({
          owner_id: organizationId,
          owner_type: "plugin::better-auth.organization",
        });

      return strapi.documents(uid).findMany({
        ...query,
        filters: {
          ...query?.filters,
          id: {
            $in: IDs.map(
              (row) => row.id,
            ) as Modules.Documents.Params.Attribute.ID[],
          },
        },
      });
    },

    async getMembers({
      organizationId,
      query,
    }: {
      organizationId: string;
      query?: Modules.Documents.ServiceParams<"plugin::better-auth.user">["findMany"];
    }) {
      const members = await strapi
        .documents("plugin::better-auth.member")
        .findMany({
          filters: {
            organizationId,
          },
          fields: ["userId"],
        });

      const users = await strapi
        .documents("plugin::better-auth.user")
        .findMany({
          ...query,
          filters: {
            ...query?.filters,
            id: {
              $in: members.map((member) => member.userId),
            },
          },
        });

      return users;
    },

    /**
     * Upserts the `api::profile.profile` linked to an organization —
     * most organizations won't have one yet, since nothing creates it
     * automatically when an org is created.
     */
    async updateProfile({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: Record<string, unknown>;
    }) {
      const [organization] = await strapi
        .documents("plugin::better-auth.organization")
        .findMany({
          filters: { id: organizationId },
          fields: ["documentId"],
          populate: { profile: { fields: ["documentId"] } },
        });

      if (!organization) return null;

      if (organization.profile) {
        return strapi.documents("api::profile.profile").update({
          documentId: organization.profile.documentId,
          data,
        });
      }

      const profile = await strapi.documents("api::profile.profile").create({
        data,
      });

      await strapi.documents("plugin::better-auth.organization").update({
        documentId: organization.documentId,
        data: { profile: profile.documentId },
      });

      return profile;
    },
  }),
);

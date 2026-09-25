/**
 * organization service
 */

import { factories, type Modules, type UID } from "@strapi/strapi";
import {
  deleteOwnedFile,
  findOwnedContentIds,
  uploadOwnedFile,
} from "../utils";

export default factories.createCoreService(
  "plugin::better-auth.organization",
  () => ({
    /**
     * Uploads a logo image to the media library, linked to the uploading
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
      return uploadOwnedFile({
        userId,
        file,
        field: "logo",
        name: `logo-${userId}`,
      });
    },

    /**
     * Removes a previously uploaded logo from the media library, but only
     * if the caller is allowed to — see `deleteOwnedFile`.
     */
    async deleteLogo({
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
        "plugin::better-auth.organization",
      );

      return strapi.documents(uid).findMany({
        ...query,
        filters: {
          ...query?.filters,
          id: {
            $in: IDs as Modules.Documents.Params.Attribute.ID[],
          },
        },
      });
    },

    /**
     * Organizations `userId` is an owner/admin of — i.e. allowed to
     * submit content on behalf of. Backs `GET /organizations/mine`, used
     * by the plugin/template submission forms' "Submit as" selector.
     */
    async getManageable({ userId }: { userId: string | number }) {
      const memberships = await strapi
        .documents("plugin::better-auth.member")
        .findMany({
          filters: {
            userId,
            role: { $in: ["admin", "owner"] },
          },
          fields: ["organizationId"],
        });

      if (memberships.length === 0) return [];

      return strapi.documents("plugin::better-auth.organization").findMany({
        filters: {
          id: {
            $in: memberships.map((membership) => membership.organizationId),
          },
        },
        fields: ["id", "name", "slug", "logo"],
        sort: { name: "asc" },
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
          populate: ["links"],
        });
      }

      const profile = await strapi.documents("api::profile.profile").create({
        data,
        populate: ["links"],
      });

      await strapi.documents("plugin::better-auth.organization").update({
        documentId: organization.documentId,
        data: { profile: profile.documentId },
      });

      return profile;
    },
  }),
);

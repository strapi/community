/**
 * organization service
 */

import { factories, type Modules, type UID } from "@strapi/strapi";
import {
  deleteOwnedFile,
  findOwnedContentIds,
  uploadOwnedFile,
} from "../utils";
import {
  levelsUpTo,
  type PartnerLevel,
  type PartnerSection,
  SECTION_MINIMUM_LEVEL,
} from "../utils/partner-levels";

/** IDs of the organizations `userId` is an owner/admin of. */
async function findManageableOrganizationIds(userId: string | number) {
  const memberships = await strapi
    .documents("plugin::better-auth.member")
    .findMany({
      filters: {
        userId,
        role: { $in: ["admin", "owner"] },
      },
      fields: ["organizationId"],
    });

  return memberships.map((membership) => membership.organizationId);
}

/** The organization's partner level, or `null` if it isn't a partner. */
async function findPartnerLevel(
  organizationId: string,
): Promise<PartnerLevel | null> {
  const [organization] = await strapi
    .documents("plugin::better-auth.organization")
    .findMany({
      filters: { id: organizationId, partner: { $eq: true } },
      fields: ["partner_level"],
    });

  if (!organization) return null;
  return organization.partner_level ?? "Unlisted";
}

/** Partner resources unlocked at `level` — by their own and their section's minimum level. */
function partnerResourceFilters(level: PartnerLevel) {
  const unlocked = levelsUpTo(level);
  const sections = (
    Object.entries(SECTION_MINIMUM_LEVEL) as [PartnerSection, PartnerLevel][]
  )
    .filter(([, minimum]) => unlocked.includes(minimum))
    .map(([section]) => section);

  return {
    minimum_level: { $in: unlocked },
    section: { $in: sections },
  };
}

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
      const organizationIds = await findManageableOrganizationIds(userId);
      if (organizationIds.length === 0) return [];

      return strapi.documents("plugin::better-auth.organization").findMany({
        filters: { id: { $in: organizationIds } },
        fields: ["id", "name", "slug", "logo"],
        sort: { name: "asc" },
      });
    },

    /**
     * Partner organizations `userId` is an owner/admin of — i.e. whose
     * partner portal they may access. Backs `GET /organizations/partners`,
     * used by the web app's user menu and the partner portal itself.
     */
    async getPartnerPortals({ userId }: { userId: string | number }) {
      const organizationIds = await findManageableOrganizationIds(userId);
      if (organizationIds.length === 0) return [];

      return strapi.documents("plugin::better-auth.organization").findMany({
        filters: { id: { $in: organizationIds }, partner: { $eq: true } },
        fields: ["id", "name", "slug", "logo", "partner_level", "createdAt"],
        populate: { profile: { fields: ["website", "location"] } },
        sort: { name: "asc" },
      });
    },

    /**
     * The partner portal's gated content for a partner organization:
     * its level, the benefits for that level, and every published
     * resource its level unlocks (both the resource's own
     * `minimum_level` and its section's). Resource bodies are left out —
     * see `getPartnerResource`. Returns `null` for non-partner
     * organizations.
     */
    async getPartnerPortal({ organizationId }: { organizationId: string }) {
      const level = await findPartnerLevel(organizationId);
      if (!level) return null;

      const [program, resources] = await Promise.all([
        strapi.documents("api::partner-program.partner-program").findFirst({
          populate: { benefits: true },
        }),
        strapi.documents("api::partner-resource.partner-resource").findMany({
          status: "published",
          filters: partnerResourceFilters(level),
          fields: [
            "title",
            "slug",
            "description",
            "section",
            "minimum_level",
            "category",
            "label",
            "icon",
            "link",
            "content",
          ],
          populate: { file: { fields: ["url", "name", "ext", "size"] } },
          sort: [{ sort_order: "asc" }, { title: "asc" }],
        }),
      ]);

      return {
        level,
        benefits: (program?.benefits ?? []).filter(
          (benefit) => benefit.level === level,
        ),
        resources: resources.map(({ content, ...resource }) => ({
          ...resource,
          has_content: !!content?.trim(),
        })),
      };
    },

    /**
     * A single partner resource, including its body — or `null` if it
     * doesn't exist or the organization's level doesn't unlock it.
     */
    async getPartnerResource({
      organizationId,
      slug,
    }: {
      organizationId: string;
      slug: string;
    }) {
      const level = await findPartnerLevel(organizationId);
      if (!level) return null;

      return strapi
        .documents("api::partner-resource.partner-resource")
        .findFirst({
          status: "published",
          filters: { ...partnerResourceFilters(level), slug: { $eq: slug } },
          populate: { file: { fields: ["url", "name", "ext", "size"] } },
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

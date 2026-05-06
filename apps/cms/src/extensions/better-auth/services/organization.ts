/**
 * organization service
 */

import { factories, type Modules, type UID } from "@strapi/strapi";
import { extractContentTypeName } from "../utils";

export default factories.createCoreService(
  "plugin::better-auth.organization",
  () => ({
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
  }),
);

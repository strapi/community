/**
 * user service
 */

import { factories, type Modules, type UID } from "@strapi/strapi";
import { extractContentTypeName } from "../utils";

export default factories.createCoreService("plugin::better-auth.user", () => ({
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
      .connection(`${contentTypeName}s_owner_mph`)
      .select(`${contentTypeName}_id`)
      .where({
        owner_id: organizationId,
        owner_type: "plugin::better-auth.user",
      });

    const ownedItems = await strapi.documents(uid).findMany({
      ...query,
      filters: {
        ...query?.filters,
        id: {
          $in: IDs.map(
            (row) => row[`${contentTypeName}_id`],
          ) as Modules.Documents.Params.Attribute.ID[],
        },
      },
    });

    const maintainedItems = await strapi.documents(uid).findMany({
      ...query,
      filters: {
        ...query?.filters,
        maintainers: {
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

import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { cmsClient } from "@/features/cms/lib/strapi";

const contentType = "api::cta.cta" satisfies UID.ContentType;

const query = {
  populate: {
    image: true,
    button: true,
  },
} satisfies GetQueryParams<typeof contentType>;

export type CommunityCTAData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

export async function fetchCommunityCTA(): Promise<CommunityCTAData | null> {
  const id = process.env.COMMUNITY_CTA_ID;
  if (!id) return null;

  try {
    const result = await cmsClient.collection(contentType).findOne(id, query);
    return result.data;
  } catch {
    return null;
  }
}

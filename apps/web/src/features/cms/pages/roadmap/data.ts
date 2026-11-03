import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { cmsClient } from "@/features/cms/lib/strapi";

const itemType = "api::roadmap-item.roadmap-item" satisfies UID.ContentType;
const releaseType = "api::release.release" satisfies UID.ContentType;

const itemQuery = {
  fields: [
    "slug",
    "public_title",
    "public_description",
    "public_status",
    "timeframe",
    "delivery_quarter",
    "release",
    "squads",
    "tags",
    "canny_url",
    "canny_votes",
    "canny_status",
    "github_links",
    "docs_link",
    "first_published_at",
    "last_synced_at",
    "updatedAt",
  ],
  sort: ["canny_votes:desc", "public_title:asc"],
  // @ts-expect-error - issue in the strapi-client
  pagination: { pageSize: 200 },
} satisfies GetQueryParams<typeof itemType>;

const releaseQuery = {
  fields: [
    "version",
    "status",
    "released_at",
    "due_on",
    "url",
    "open_issues",
    "closed_issues",
  ],
  // @ts-expect-error - issue in the strapi-client
  pagination: { pageSize: 100 },
} satisfies GetQueryParams<typeof releaseType>;

export type RoadmapItem = Modules.Documents.Result<
  typeof itemType,
  typeof itemQuery
>;
export type RoadmapRelease = Modules.Documents.Result<
  typeof releaseType,
  typeof releaseQuery
>;

export * from "./types";

// The CMS route only ever serves published items, whatever the query says.
export async function fetchRoadmapItems(): Promise<RoadmapItem[]> {
  const res = await cmsClient.collection(itemType).find(itemQuery);
  return res.data;
}

/** Releases are supplementary: the roadmap still renders without them. */
export async function fetchRoadmapReleases(): Promise<RoadmapRelease[]> {
  try {
    const res = await cmsClient.collection(releaseType).find(releaseQuery);
    return res.data;
  } catch {
    return [];
  }
}

/** Just enough for link-preview metadata on `/roadmap?item=<slug>`. */
export async function fetchRoadmapItemSummary(slug: string) {
  const res = await cmsClient.collection(itemType).find({
    fields: ["slug", "public_title", "public_description"],
    filters: { slug: { $eq: slug } },
    pagination: { pageSize: 1 },
  });
  return res.data[0] ?? null;
}

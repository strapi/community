import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { cache } from "react";
import { cmsClient } from "@/features/cms/lib/strapi";

const itemType = "api::roadmap-item.roadmap-item" satisfies UID.ContentType;
const releaseType = "api::release.release" satisfies UID.ContentType;

// The CMS caps REST page size at 100 (`api.rest.maxLimit`), so larger
// collections are read page by page.
const PAGE_SIZE = 100;

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
  populate: { url_alias: { fields: ["url_path"] } },
  // id last keeps the order total, so pages never overlap.
  sort: ["canny_votes:desc", "public_title:asc", "id:asc"],
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
  sort: ["version:asc"],
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

import { githubLinks, safeHref } from "./types";

/** Every document of a collection, fetched page by page. */
async function findAll<TResult>(
  find: (page: number) => Promise<{
    data: TResult[];
    meta: { pagination?: { pageCount: number } };
  }>,
): Promise<TResult[]> {
  const all: TResult[] = [];
  for (let page = 1; ; page++) {
    const res = await find(page);
    all.push(...res.data);
    if (page >= (res.meta.pagination?.pageCount ?? 1)) return all;
  }
}

// The CMS route only ever serves published items, whatever the query says.
// Every URL is scheme-checked here, once, so components can render hrefs
// from these objects without re-validating.
// Cached per request: the overview hero and the roadmap section both read it.
export const fetchRoadmapItems = cache(async (): Promise<RoadmapItem[]> => {
  const items = await findAll((page) =>
    cmsClient.collection(itemType).find({
      ...itemQuery,
      pagination: { page, pageSize: PAGE_SIZE },
    }),
  );
  return items.map((item) => ({
    ...item,
    canny_url: safeHref(item.canny_url),
    docs_link: safeHref(item.docs_link),
    github_links: githubLinks(item.github_links).filter((l) => safeHref(l.url)),
  }));
});

/** Releases are supplementary: the roadmap still renders without them. */
export async function fetchRoadmapReleases(): Promise<RoadmapRelease[]> {
  try {
    const releases = await findAll((page) =>
      cmsClient.collection(releaseType).find({
        ...releaseQuery,
        pagination: { page, pageSize: PAGE_SIZE },
      }),
    );
    return releases.map((r) => ({ ...r, url: safeHref(r.url) }));
  } catch {
    return [];
  }
}

/** Just enough for an item's link-preview metadata. */
export async function fetchRoadmapItemSummary(documentId: string) {
  const res = await cmsClient.collection(itemType).findOne(documentId, {
    fields: ["slug", "public_title", "public_description"],
  });
  return res.data;
}

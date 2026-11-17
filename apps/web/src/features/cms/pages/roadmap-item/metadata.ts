import type { Metadata } from "next";
import { findPublishedPage } from "@/features/cms/lib/webtools";
import { overviewPageMetadata } from "@/features/cms/pages/overview-page";
import { fetchRoadmapItemSummary } from "@/features/roadmap";
import { roadmapItemParentPath } from "./page";

// The roadmap page's metadata, with the item's own title and description so
// shared item links unfurl usefully in Slack, Canny, etc.
export const roadmapItemMetadata = async (
  documentId: string,
  path: string,
): Promise<Metadata> => {
  const [item, page] = await Promise.all([
    fetchRoadmapItemSummary(documentId),
    findPublishedPage(roadmapItemParentPath(path)),
  ]);
  const metadata = await overviewPageMetadata(page.documentId);

  const title = `${item.public_title} | Roadmap`;
  const description = item.public_description ?? undefined;
  return {
    ...metadata,
    title,
    description,
    // Canonical at the item's own URL (the catch-all's default).
    alternates: { ...metadata.alternates, canonical: undefined },
    openGraph: { ...metadata.openGraph, title, description },
    twitter: { ...metadata.twitter, title, description },
  };
};

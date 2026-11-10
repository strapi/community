import { findPublishedPage } from "@/features/cms/lib/webtools";
import { OverviewPage } from "@/features/cms/pages/overview-page";
import { fetchRoadmapItemSummary, RoadmapRoute } from "@/features/roadmap";

type Props = {
  documentId: string;
  path: string;
};

/** The page an item's URL lives under, e.g. `/roadmap` for `/roadmap/foo`. */
export const roadmapItemParentPath = (path: string) =>
  path.replace(/\/[^/]+\/?$/, "") || "/";

/**
 * A roadmap item has no page of its own: its URL renders the roadmap page it
 * lives under, with the item's dialog open.
 */
const RoadmapItemPage = async ({ documentId, path }: Props) => {
  const basePath = roadmapItemParentPath(path);
  const [item, page] = await Promise.all([
    fetchRoadmapItemSummary(documentId),
    findPublishedPage(basePath),
  ]);

  return (
    <RoadmapRoute item={item.slug ?? undefined} basePath={basePath}>
      <OverviewPage documentId={page.documentId} path={basePath} />
    </RoadmapRoute>
  );
};

export { RoadmapItemPage };

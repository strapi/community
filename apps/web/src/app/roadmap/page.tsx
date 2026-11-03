import type { Metadata, NextPage } from "next";
import {
  fetchRoadmapItemSummary,
  RoadmapList,
  type RoadmapSort,
  type RoadmapState,
} from "@/features/cms/pages/roadmap";

// Rendered per request, like the CMS catch-all: the CMS isn't reachable at
// build time, and the data only changes once a night anyway.
export const dynamic = "force-dynamic";

type Param = string | string[] | undefined;
type SearchParams = Record<
  "q" | "sort" | "view" | "release" | "area" | "item",
  Param
>;

type PageProps = { searchParams: Promise<SearchParams> };

const first = (v: Param) => (Array.isArray(v) ? v[0] : v) || undefined;
const all = (v: Param) => (Array.isArray(v) ? v : v ? [v] : []);

const SORTS: RoadmapSort[] = ["votes", "newest", "release", "title"];

/** Untrusted query → a valid initial view state. */
function toState(params: SearchParams): RoadmapState {
  const sort = first(params.sort) as RoadmapSort | undefined;
  return {
    q: first(params.q)?.slice(0, 100) ?? "",
    sort: sort && SORTS.includes(sort) ? sort : "votes",
    view: first(params.view) === "timeline" ? "timeline" : "board",
    releases: all(params.release),
    areas: all(params.area),
  };
}

const DEFAULT_METADATA: Metadata = {
  title: "Roadmap",
  description:
    "What the Strapi team is building now, what's next, and what's planned for later.",
  alternates: { canonical: "/roadmap" },
};

// Items open in a modal at `/roadmap?item=<slug>`. Give those links the
// item's own title/description so they unfurl usefully in Slack, Canny, etc.
export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const slug = first((await searchParams).item);
  if (!slug) return DEFAULT_METADATA;

  const item = await fetchRoadmapItemSummary(slug).catch(() => null);
  if (!item) return DEFAULT_METADATA;

  const title = `${item.public_title} | Roadmap`;
  const url = `/roadmap?item=${encodeURIComponent(item.slug ?? slug)}`;
  return {
    title,
    description: item.public_description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: item.public_description ?? undefined,
      type: "website",
      url,
    },
  };
}

const RoadmapPage: NextPage<PageProps> = async ({ searchParams }) => {
  const params = await searchParams;
  return (
    <RoadmapList
      initialState={toState(params)}
      initialItem={first(params.item)}
    />
  );
};

export default RoadmapPage;

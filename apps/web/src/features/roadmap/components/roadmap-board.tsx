"use client";

import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type InstantSearchServerState,
  useClearRefinements,
  useHits,
  useRefinementList,
  useSearchBox,
  useSortBy,
} from "react-instantsearch";
import { replaceUrlInPage } from "@/features/analytics";
import { SearchIndex } from "@/features/search/components/search-index";
import { SEARCH_INDEXES } from "@/features/search/lib/indexes";
import { cn } from "@/lib/utils";
import type { RoadmapItem, RoadmapRelease } from "../lib/data";
import { ROADMAP_SORT_INDEXES, roadmapRouting } from "../lib/search";
import {
  compareVersions,
  formatDate,
  itemPath,
  parseRoadmapState,
  type RoadmapView,
  UNSCHEDULED,
  withSafeLinks,
} from "../lib/types";
import { RoadmapCard } from "./roadmap-card";
import { RoadmapItemDialog } from "./roadmap-item-dialog";
import { useRoadmapRoute } from "./roadmap-route";
import { type FacetOption, RoadmapSidebar } from "./roadmap-sidebar";

const SORTS = [
  { value: ROADMAP_SORT_INDEXES.votes, label: "Most votes" },
  { value: ROADMAP_SORT_INDEXES.newest, label: "Newest" },
  { value: ROADMAP_SORT_INDEXES.release, label: "Release" },
  { value: ROADMAP_SORT_INDEXES.title, label: "A–Z" },
];

// High enough that no release or area is ever cut off.
const FACET_LIMIT = 100;

const releaseKey = (item: RoadmapItem) => item.release || UNSCHEDULED;

/** Newest version first, unscheduled last. */
const releaseOrder = (a: { name: string }, b: { name: string }) =>
  a.name === UNSCHEDULED
    ? 1
    : b.name === UNSCHEDULED
      ? -1
      : compareVersions(b.name, a.name);

/**
 * Mirror the view and open item into the address bar so any state can be
 * shared: the open item as its own path, the view as a query param. The
 * search params are kept as they are; the search router writes those (see
 * roadmapRouting). Plain History API (not router.replace) so nothing
 * round-trips to the server.
 */
function writeUrl(view: RoadmapView, pathname: string, item?: string | null) {
  const url = new URL(window.location.href);
  url.pathname = pathname;
  url.searchParams.delete("view");
  url.searchParams.delete("item");
  if (view !== "board") url.searchParams.set("view", view);
  if (item) url.searchParams.set("item", item);
  replaceUrlInPage(url);
}

const Column = ({
  title,
  dot,
  items,
  children,
}: {
  title: string;
  dot: string;
  items: RoadmapItem[];
  children: (item: RoadmapItem) => React.ReactNode;
}) => (
  <section
    aria-label={title}
    className="rounded-2xl border border-(--color-neutral150) bg-(--color-neutral100)"
  >
    <header className="flex items-center gap-2.5 border-b border-(--color-neutral150) px-5 py-4">
      <span aria-hidden className={cn("h-2.5 w-2.5 rounded-full", dot)} />
      <h2 className="flex-1 font-semibold text-(--color-neutral900)">
        {title}
      </h2>
      <span className="rounded-full bg-white px-2.5 py-0.5 text-xs tabular-nums text-(--color-neutral600)">
        {items.length}
      </span>
    </header>
    {items.length > 0 ? (
      <ul className="space-y-3 p-3">{items.map(children)}</ul>
    ) : (
      <p className="p-5 text-sm text-(--color-neutral600)">
        Nothing here matches.
      </p>
    )}
  </section>
);

/**
 * The roadmap, searched, filtered and sorted through its Meilisearch index.
 * The server renders the whole index as the first results; the board then
 * applies whatever the URL asks for.
 */
const RoadmapBoard = ({
  serverState,
  total,
  releases,
}: {
  serverState?: InstantSearchServerState;
  /** Published items in total, for the "x of y" count. */
  total: number;
  releases: RoadmapRelease[];
}) => {
  const pathname = usePathname();
  // Created once: the board rewrites the path itself when an item opens.
  const [routing] = useState(() => roadmapRouting(pathname));

  return (
    <SearchIndex
      indexName={SEARCH_INDEXES.roadmap.indexName}
      serverState={serverState}
      routing={routing}
    >
      <SearchIndex.Configure hitsPerPage={SEARCH_INDEXES.roadmap.hitsPerPage} />
      <Board total={total} releases={releases} />
    </SearchIndex>
  );
};

const Board = ({
  total,
  releases,
}: {
  total: number;
  releases: RoadmapRelease[];
}) => {
  const route = useRoadmapRoute();
  const basePath = useRef(route.basePath);
  const [view, setView] = useState<RoadmapView>("board");
  const [openItem, setOpenItem] = useState<RoadmapItem | null>(null);

  const { query, refine: search } = useSearchBox();
  const sort = useSortBy({ items: SORTS });
  const release = useRefinementList({
    attribute: "release_key",
    limit: FACET_LIMIT,
    sortBy: releaseOrder,
  });
  const area = useRefinementList({
    attribute: "squads",
    limit: FACET_LIMIT,
    sortBy: ["name:asc"],
  });
  const { refine: clearFilters } = useClearRefinements({
    includedAttributes: ["release_key", "squads"],
  });
  const { refine: clearAll } = useClearRefinements({
    includedAttributes: ["release_key", "squads", "query"],
  });
  const { items: hits } = useHits<RoadmapItem>();
  const visible = useMemo(() => hits.map(withSafeLinks), [hits]);

  /** Write the view and open item (or none) to the address bar. */
  const sync = useCallback(
    (nextView: RoadmapView, item: RoadmapItem | null) => {
      basePath.current ??= window.location.pathname;
      const path = item && itemPath(item);
      // An item without an alias yet falls back to `?item=` on the page.
      writeUrl(
        nextView,
        path ?? basePath.current,
        path ? undefined : item?.slug,
      );
    },
    [],
  );

  // The page is statically rendered (ISR) with the default view, so restore
  // a shared view from the URL after hydration. The search state restores
  // itself (see roadmapRouting).
  useEffect(() => {
    setView(
      parseRoadmapState(new URLSearchParams(window.location.search)).view,
    );
  }, []);

  // Likewise the open item: the item's own path (via RoadmapRoute) or an
  // old-style `?item=` link, which moves to the item's path. Unknown or
  // unpublished items just drop the param. Runs once, against the first
  // results, which are the server-rendered, unfiltered index.
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current || visible.length === 0) return;
    restored.current = true;
    const params = new URLSearchParams(window.location.search);
    const slug = route.item ?? params.get("item");
    const found = visible.find((i) => i.slug === slug) ?? null;
    if (found) setOpenItem(found);
    if (params.has("item")) sync(parseRoadmapState(params).view, found);
  }, [visible, route.item, sync]);

  const changeView = (next: RoadmapView) => {
    setView(next);
    sync(next, openItem);
  };

  const open = useCallback(
    (slug: string) => {
      const item = visible.find((i) => i.slug === slug) ?? null;
      setOpenItem(item);
      sync(view, item);
    },
    [visible, view, sync],
  );
  const close = useCallback(() => {
    setOpenItem(null);
    sync(view, null);
  }, [view, sync]);

  const releasesByVersion = useMemo(
    () => new Map(releases.map((r) => [r.version, r])),
    [releases],
  );

  // ── Facets (zero-count options stay listed, see keepZeroFacets) ───────
  const releaseOptions: FacetOption[] = release.items.map((o) => ({
    value: o.value,
    count: o.count,
    label: o.value === UNSCHEDULED ? "Unscheduled" : o.value,
  }));
  const areaOptions: FacetOption[] = area.items.map((o) => ({
    value: o.value,
    count: o.count,
    label: o.label,
  }));
  const refined = (items: { value: string; isRefined: boolean }[]) =>
    items.filter((o) => o.isRefined).map((o) => o.value);

  // Upcoming first (soonest version first), then the latest three shipped.
  // Versions that only exist in Notion so far show as planned, unlinked.
  // The release facet lists every version any item targets.
  const schedule: RoadmapRelease[] = useMemo(() => {
    const planned = release.items
      .map((o) => o.value)
      .filter((v) => v !== UNSCHEDULED && !releasesByVersion.has(v))
      .map(
        (version) =>
          ({
            version,
            status: "upcoming",
            url: null,
          }) as RoadmapRelease,
      );
    const upcoming = [
      ...releases.filter((r) => r.status === "upcoming"),
      ...planned,
    ].sort((a, b) => compareVersions(a.version ?? "", b.version ?? ""));
    const shipped = releases
      .filter((r) => r.status === "released")
      .sort((a, b) => compareVersions(b.version ?? "", a.version ?? ""))
      .slice(0, 3);
    return [...upcoming, ...shipped];
  }, [release.items, releases, releasesByVersion]);

  const planned = visible.filter((i) => i.public_status === "exploring");
  const inProgress = visible.filter(
    (i) => i.public_status === "in_progress" || i.public_status === "beta",
  );
  const shipped = visible.filter((i) => i.public_status === "shipped");

  const card = (item: RoadmapItem) => (
    <RoadmapCard
      key={item.documentId}
      item={item}
      release={item.release ? releasesByVersion.get(item.release) : undefined}
      onOpen={open}
    />
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      <RoadmapSidebar
        view={view}
        onViewChange={changeView}
        releaseOptions={releaseOptions}
        areaOptions={areaOptions}
        selectedReleases={refined(release.items)}
        selectedAreas={refined(area.items)}
        onToggleRelease={release.refine}
        onToggleArea={area.refine}
        onClear={clearFilters}
        schedule={schedule}
      />

      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search the roadmap</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-(--color-neutral600)"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => search(e.target.value)}
              placeholder="Search the roadmap"
              className="w-full rounded-lg border border-(--color-neutral300) bg-white py-3 pr-4 pl-11 text-sm text-(--color-neutral900) placeholder:text-(--color-neutral600) focus:border-(--color-primary600) focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-(--color-neutral300) bg-white px-4 text-sm text-(--color-neutral800) focus-within:border-(--color-primary600)">
            <span className="text-(--color-neutral600)">Sort:</span>
            <select
              value={sort.currentRefinement}
              onChange={(e) => sort.refine(e.target.value)}
              className="h-11 cursor-pointer bg-transparent pr-1 font-medium focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p
          className="mt-3 text-sm text-(--color-neutral600)"
          aria-live="polite"
        >
          {total
            ? `${visible.length} of ${total} items`
            : `${visible.length} items`}
        </p>

        {visible.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-(--color-neutral300) p-10 text-center text-(--color-neutral700)">
            <p>Nothing matches.</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-2 font-medium text-(--color-primary600) hover:underline"
            >
              Clear search and filters
            </button>
          </div>
        ) : view === "board" ? (
          <>
            <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
              <Column
                title="Planned"
                dot="bg-(--color-primary600)"
                items={planned}
              >
                {card}
              </Column>
              <Column
                title="In progress"
                dot="bg-(--color-primary400)"
                items={inProgress}
              >
                {card}
              </Column>
            </div>
            {shipped.length > 0 && (
              <section aria-label="Shipped" className="mt-10">
                <h2 className="flex items-center gap-2.5 font-semibold text-(--color-neutral900)">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-full bg-(--color-success600)"
                  />
                  Recently shipped
                  <span className="text-sm font-normal text-(--color-neutral600)">
                    {shipped.length}
                  </span>
                </h2>
                <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {shipped.map(card)}
                </ul>
              </section>
            )}
          </>
        ) : (
          <Timeline
            items={visible}
            releasesByVersion={releasesByVersion}
            card={card}
          />
        )}
      </div>

      <RoadmapItemDialog
        item={openItem}
        release={
          openItem?.release
            ? releasesByVersion.get(openItem.release)
            : undefined
        }
        onClose={close}
      />
    </div>
  );
};

/** Items grouped by release: upcoming (soonest first), shipped, unscheduled. */
const Timeline = ({
  items,
  releasesByVersion,
  card,
}: {
  items: RoadmapItem[];
  releasesByVersion: Map<string | null | undefined, RoadmapRelease>;
  card: (item: RoadmapItem) => React.ReactNode;
}) => {
  const groups = new Map<string, RoadmapItem[]>();
  for (const item of items) {
    const key = releaseKey(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const isShipped = (v: string) =>
    releasesByVersion.get(v)?.status === "released";
  const order = [...groups.keys()].sort((a, b) => {
    if (a === UNSCHEDULED) return 1;
    if (b === UNSCHEDULED) return -1;
    if (isShipped(a) !== isShipped(b)) return isShipped(a) ? 1 : -1;
    return isShipped(a) ? compareVersions(b, a) : compareVersions(a, b);
  });

  return (
    <ol className="mt-6 space-y-10">
      {order.map((key) => {
        const release = releasesByVersion.get(key);
        const label =
          key === UNSCHEDULED
            ? "Not tied to a release yet"
            : release?.status === "released"
              ? `Released ${formatDate(release.released_at)}`
              : release
                ? "Upcoming"
                : "Planned";
        return (
          <li key={key}>
            <div className="mb-4 flex items-baseline gap-3 border-b border-(--color-neutral150) pb-2">
              <h2
                className={cn(
                  "text-lg font-semibold text-(--color-neutral900)",
                  key !== UNSCHEDULED && "font-mono",
                )}
              >
                {key === UNSCHEDULED ? "Unscheduled" : key}
              </h2>
              <span className="text-sm text-(--color-neutral600)">{label}</span>
              <span className="ml-auto text-xs tabular-nums text-(--color-neutral600)">
                {groups.get(key)?.length}
              </span>
            </div>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {groups.get(key)?.map(card)}
            </ul>
          </li>
        );
      })}
    </ol>
  );
};

export { RoadmapBoard };

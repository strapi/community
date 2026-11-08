"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { replaceUrlInPage } from "@/features/analytics";
import { cn } from "@/lib/utils";
import type { RoadmapItem, RoadmapRelease } from "../lib/data";
import {
  compareVersions,
  DEFAULT_ROADMAP_STATE,
  formatDate,
  itemPath,
  parseRoadmapState,
  type RoadmapSort,
  type RoadmapState,
  type RoadmapView,
  stringList,
  UNSCHEDULED,
} from "../lib/types";
import { RoadmapCard } from "./roadmap-card";
import { RoadmapItemDialog } from "./roadmap-item-dialog";
import { useRoadmapRoute } from "./roadmap-route";
import { type FacetOption, RoadmapSidebar } from "./roadmap-sidebar";

const SORTS: { value: RoadmapSort; label: string }[] = [
  { value: "votes", label: "Most votes" },
  { value: "newest", label: "Newest" },
  { value: "release", label: "Release" },
  { value: "title", label: "A–Z" },
];

const releaseKey = (item: RoadmapItem) => item.release || UNSCHEDULED;

/**
 * Mirror the view into the address bar so any state can be shared: the open
 * item as its own path, the rest as query params. Plain History API (not
 * router.replace) so nothing round-trips to the server.
 */
function writeUrl(state: RoadmapState, pathname: string, item?: string | null) {
  const url = new URL(window.location.href);
  url.pathname = pathname;
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.sort !== "votes") p.set("sort", state.sort);
  if (state.view !== "board") p.set("view", state.view);
  for (const r of state.releases) p.append("release", r);
  for (const a of state.areas) p.append("area", a);
  if (item) p.set("item", item);
  url.search = p.toString();
  replaceUrlInPage(url);
}

function sortItems(items: RoadmapItem[], sort: RoadmapSort) {
  const byTitle = (a: RoadmapItem, b: RoadmapItem) =>
    (a.public_title ?? "").localeCompare(b.public_title ?? "");
  const copy = [...items];
  switch (sort) {
    case "newest":
      return copy.sort(
        (a, b) =>
          Date.parse(String(b.first_published_at ?? 0)) -
            Date.parse(String(a.first_published_at ?? 0)) || byTitle(a, b),
      );
    case "release":
      return copy.sort((a, b) => {
        if (!a.release !== !b.release) return a.release ? -1 : 1;
        return (
          compareVersions(b.release ?? "0", a.release ?? "0") || byTitle(a, b)
        );
      });
    case "title":
      return copy.sort(byTitle);
    default:
      return copy.sort(
        (a, b) => (b.canny_votes ?? 0) - (a.canny_votes ?? 0) || byTitle(a, b),
      );
  }
}

function countBy(
  items: RoadmapItem[],
  keys: (i: RoadmapItem) => string[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const k of keys(item)) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
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

const RoadmapBoard = ({
  items,
  releases,
}: {
  items: RoadmapItem[];
  releases: RoadmapRelease[];
}) => {
  const route = useRoadmapRoute();
  const basePath = useRef(route.basePath);
  const [state, setState] = useState<RoadmapState>(DEFAULT_ROADMAP_STATE);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  /** Write the view and open item (or none) to the address bar. */
  const sync = useCallback(
    (next: RoadmapState, slug: string | null) => {
      basePath.current ??= window.location.pathname;
      const item = slug ? items.find((i) => i.slug === slug) : undefined;
      const path = item && itemPath(item);
      // An item without an alias yet falls back to `?item=` on the page.
      writeUrl(next, path ?? basePath.current, path ? undefined : item?.slug);
    },
    [items],
  );

  // The page is statically rendered (ISR) with the default view, so restore
  // a shared view and open item from the URL after hydration: the item's own
  // path (via RoadmapRoute) or an old-style `?item=` link, which moves to
  // the item's path. Unknown/unpublished items just drop the param.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const restored = parseRoadmapState(params);
    const slug = route.item ?? params.get("item") ?? null;
    const found = items.some((i) => i.slug === slug);
    setState(restored);
    if (found) setOpenSlug(slug);
    if (params.has("item")) sync(restored, found ? slug : null);
  }, [items, route.item, sync]);

  const update = useCallback(
    (patch: Partial<RoadmapState>) => {
      setState((prev) => {
        const next = { ...prev, ...patch };
        sync(next, openSlug);
        return next;
      });
    },
    [openSlug, sync],
  );

  const open = useCallback(
    (slug: string) => {
      setOpenSlug(slug);
      sync(state, slug);
    },
    [state, sync],
  );
  const close = useCallback(() => {
    setOpenSlug(null);
    sync(state, null);
  }, [state, sync]);

  const toggle = (key: "releases" | "areas", value: string) =>
    update({
      [key]: state[key].includes(value)
        ? state[key].filter((v) => v !== value)
        : [...state[key], value],
    });

  const releasesByVersion = useMemo(
    () => new Map(releases.map((r) => [r.version, r])),
    [releases],
  );

  // ── Facets (counted over everything, so options never vanish) ─────────
  const releaseOptions: FacetOption[] = useMemo(() => {
    const counts = countBy(items, (i) => [releaseKey(i)]);
    return [...counts.entries()]
      .sort(([a], [b]) =>
        a === UNSCHEDULED ? 1 : b === UNSCHEDULED ? -1 : compareVersions(b, a),
      )
      .map(([value, count]) => ({
        value,
        count,
        label: value === UNSCHEDULED ? "Unscheduled" : value,
      }));
  }, [items]);

  const areaOptions: FacetOption[] = useMemo(() => {
    const counts = countBy(items, (i) => stringList(i.squads));
    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, count]) => ({ value, count, label: value }));
  }, [items]);

  // Upcoming first (soonest version first), then the latest three shipped.
  // Versions that only exist in Notion so far show as planned, unlinked.
  const schedule: RoadmapRelease[] = useMemo(() => {
    const planned = [...new Set(items.map((i) => i.release).filter(Boolean))]
      .filter((v) => !releasesByVersion.has(v as string))
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
  }, [items, releases, releasesByVersion]);

  // ── Filter + sort ──────────────────────────────────────────────────────
  const visible = useMemo(() => {
    const q = state.q.trim().toLowerCase();
    return sortItems(
      items.filter((i) => {
        if (state.releases.length && !state.releases.includes(releaseKey(i)))
          return false;
        if (
          state.areas.length &&
          !stringList(i.squads).some((a) => state.areas.includes(a))
        )
          return false;
        if (!q) return true;
        return [i.public_title, i.public_description, ...stringList(i.squads)]
          .join(" ")
          .toLowerCase()
          .includes(q);
      }),
      state.sort,
    );
  }, [items, state]);

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

  const openItem = items.find((i) => i.slug === openSlug) ?? null;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      <RoadmapSidebar
        view={state.view}
        onViewChange={(view: RoadmapView) => update({ view })}
        releaseOptions={releaseOptions}
        areaOptions={areaOptions}
        selectedReleases={state.releases}
        selectedAreas={state.areas}
        onToggleRelease={(v) => toggle("releases", v)}
        onToggleArea={(v) => toggle("areas", v)}
        onClear={() => update({ releases: [], areas: [] })}
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
              value={state.q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Search the roadmap"
              className="w-full rounded-lg border border-(--color-neutral300) bg-white py-3 pr-4 pl-11 text-sm text-(--color-neutral900) placeholder:text-(--color-neutral600) focus:border-(--color-primary600) focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-(--color-neutral300) bg-white px-4 text-sm text-(--color-neutral800) focus-within:border-(--color-primary600)">
            <span className="text-(--color-neutral600)">Sort:</span>
            <select
              value={state.sort}
              onChange={(e) => update({ sort: e.target.value as RoadmapSort })}
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
          {visible.length} of {items.length} items
        </p>

        {visible.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-(--color-neutral300) p-10 text-center text-(--color-neutral700)">
            <p>Nothing matches.</p>
            <button
              type="button"
              onClick={() => update({ q: "", releases: [], areas: [] })}
              className="mt-2 font-medium text-(--color-primary600) hover:underline"
            >
              Clear search and filters
            </button>
          </div>
        ) : state.view === "board" ? (
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

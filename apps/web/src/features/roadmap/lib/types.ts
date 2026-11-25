// Client-safe types and pure helpers (no server-only imports).

import type { RoadmapItem } from "./data";

export type PublicStatus = "exploring" | "in_progress" | "beta" | "shipped";

/** Board column an item sits in. */
export type RoadmapStage = "planned" | "in_progress" | "shipped";

/**
 * The board mirrors the Notion board, whose columns are the `When?`
 * property (`timeframe`): Now → In progress, Next/Later → Planned,
 * Done → Shipped. A shipped status always wins (it's a fact), and items
 * without a timeframe (or "TBD") fall back to their status.
 */
export function roadmapStage(item: {
  public_status?: string | null;
  timeframe?: string | null;
}): RoadmapStage {
  if (item.public_status === "shipped") return "shipped";
  switch (item.timeframe) {
    case "now":
      return "in_progress";
    case "next":
    case "later":
      return "planned";
    case "done":
      return "shipped";
  }
  return item.public_status === "in_progress" || item.public_status === "beta"
    ? "in_progress"
    : "planned";
}

/** The badge shown on an item: its stage, or Beta while in progress. */
export function displayStatus(item: {
  public_status?: string | null;
  timeframe?: string | null;
}): "planned" | "in_progress" | "beta" | "shipped" {
  const stage = roadmapStage(item);
  return stage === "in_progress" && item.public_status === "beta"
    ? "beta"
    : stage;
}

export type GithubLink = {
  url: string;
  kind?: "issue" | "pull_request" | "link";
  state?: "open" | "closed" | "merged";
};

export type RoadmapSort = "votes" | "newest" | "release" | "title";
export type RoadmapView = "board" | "timeline";

export type RoadmapState = {
  q: string;
  sort: RoadmapSort;
  view: RoadmapView;
  releases: string[];
  areas: string[];
};

export const DEFAULT_ROADMAP_STATE: RoadmapState = {
  q: "",
  sort: "votes",
  view: "board",
  releases: [],
  areas: [],
};

const SORTS: RoadmapSort[] = ["votes", "newest", "release", "title"];

/** Untrusted query → a valid view state. */
export function parseRoadmapState(params: URLSearchParams): RoadmapState {
  const sort = params.get("sort") as RoadmapSort | null;
  return {
    q: params.get("q")?.slice(0, 100) ?? "",
    sort: sort && SORTS.includes(sort) ? sort : "votes",
    view: params.get("view") === "timeline" ? "timeline" : "board",
    releases: params.getAll("release"),
    areas: params.getAll("area"),
  };
}

/**
 * Squads that are really editions (the plan a feature ships in) rather than
 * product areas. Core is the open-source edition.
 */
export const EDITIONS = ["Core", "Enterprise"] as const;
export type Edition = (typeof EDITIONS)[number];
export const isEdition = (squad: string): squad is Edition =>
  (EDITIONS as readonly string[]).includes(squad);

/** Filter key for items with no release. */
export const UNSCHEDULED = "unscheduled";

/**
 * Only http(s) URLs may become an href. Defence in depth: the sync already
 * rejects other schemes, but a `javascript:` URL that ever reached the CMS
 * would otherwise render as a live, clickable link.
 */
export function safeHref(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

/**
 * Every URL on an item, scheme-checked once, so components can render hrefs
 * from it without re-validating.
 */
export const withSafeLinks = (item: RoadmapItem): RoadmapItem => ({
  ...item,
  canny_url: safeHref(item.canny_url),
  docs_link: safeHref(item.docs_link),
  github_links: githubLinks(item.github_links).filter((l) => safeHref(l.url)),
});

/** An item's own URL (its webtools alias), if it has one yet. */
export const itemPath = (item: {
  url_alias?: { url_path?: string | null }[] | null;
}): string | null => item.url_alias?.[0]?.url_path ?? null;

/** JSON attributes come back untyped; narrow them to string arrays. */
export const stringList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];

export const githubLinks = (value: unknown): GithubLink[] =>
  Array.isArray(value)
    ? value.filter(
        (v): v is GithubLink =>
          typeof v === "object" && v !== null && typeof v.url === "string",
      )
    : [];

/** Numeric version compare: "5.9" < "5.10" < "5.10.1". */
export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** "GitHub issue #123" / "GitHub PR #123" / host+path for other links. */
export function githubLinkLabel(link: GithubLink): {
  label: string;
  ref: string;
} {
  const match = link.url.match(
    /github\.com\/([^/]+)\/([^/]+)\/(issues|pull)\/(\d+)/,
  );
  if (!match) {
    return { label: "GitHub", ref: link.url.replace(/^https?:\/\//, "") };
  }
  const isPr = link.kind === "pull_request" || match[3] === "pull";
  return { label: isPr ? "GitHub PR" : "GitHub issue", ref: `#${match[4]}` };
}

export function formatDate(
  value: string | Date | null | undefined,
  style: "long" | "month" = "long",
): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(
    "en-US",
    style === "month"
      ? { month: "short", year: "numeric", timeZone: "UTC" }
      : { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" },
  );
}

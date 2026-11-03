// Client-safe types and pure helpers (no server-only imports).

export type PublicStatus = "exploring" | "in_progress" | "beta" | "shipped";
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

/** Filter key for items with no release. */
export const UNSCHEDULED = "unscheduled";

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

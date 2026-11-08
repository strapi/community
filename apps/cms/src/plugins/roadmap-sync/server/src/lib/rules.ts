/**
 * Pure roadmap-sync rules: Notion property extraction, the internal → public
 * status mapping, validation and slug/URL helpers.
 *
 * Imports nothing but Node built-ins, so it can be unit-tested with
 * `node --test` directly, without a build step.
 *
 * The publishing path never infers anything: every value here is either a
 * verbatim copy of what a human wrote in Notion or a fixed lookup table.
 */

import { BlockList, isIP } from "node:net";

// ── Notion property names (Product Roadmap data source) ─────────────────────
// Read-only: the sync never writes to Notion. The ones marked "optional" don't
// exist in the Notion DB; while absent they simply read as empty.
export const NOTION_PROPS = {
  /** The page title, published as the public title. */
  name: "Name",
  publicDescription: "Public description",
  status: "Status",
  when: "When?",
  deliveryQuarter: "Delivery Quarter",
  squad: "Squad",
  tags: "Tags",
  cannyLink: "Canny Link",
  githubLinks: "GitHub links", // optional
  docsLink: "Docs link", // optional
  publicReviewDate: "Public review date", // optional
  publicRoadmap: "Public Roadmap",
  release: "Version & date (Release)",
} as const;

export type PublicStatus = "exploring" | "in_progress" | "beta" | "shipped";
export type Timeframe = "now" | "next" | "later" | "done" | "tbd";

/** Internal Notion status → public status. `null` = never published. */
const STATUS_MAP: Record<string, PublicStatus | null> = {
  "not started": "exploring",
  "in product discovery": "exploring",
  "in tech discovery": "exploring",
  "ready to dev": "in_progress",
  "in delivery - on track": "in_progress",
  "in delivery - late": "in_progress",
  "in beta release": "beta",
  done: "shipped",
  paused: null,
};

const TIMEFRAMES: readonly Timeframe[] = [
  "now",
  "next",
  "later",
  "done",
  "tbd",
];

export const STALE_AFTER_DAYS = 60;

// ── Minimal Notion API shapes (only what we read) ───────────────────────────
type RichText = { plain_text?: string };
type NamedOption = { name?: string } | null;

export type NotionProperty = {
  type?: string;
  title?: RichText[];
  rich_text?: RichText[];
  url?: string | null;
  select?: NamedOption;
  status?: NamedOption;
  multi_select?: { name?: string }[];
  checkbox?: boolean;
  date?: { start?: string | null } | null;
};

export type NotionPage = {
  id: string;
  url?: string;
  last_edited_time?: string;
  archived?: boolean;
  in_trash?: boolean;
  properties: Record<string, NotionProperty | undefined>;
};

export type RoadmapRow = {
  notionPageId: string;
  notionUrl: string | null;
  /** Page title, or "(untitled)" — for the internal report. */
  internalName: string;
  publicTitle: string | null;
  publicDescription: string | null;
  internalStatus: string | null;
  publicStatus: PublicStatus | null;
  timeframe: Timeframe | null;
  deliveryQuarter: string | null;
  squads: string[];
  tags: string[];
  cannyUrl: string | null;
  githubLinks: string[];
  docsLink: string | null;
  publicReviewDate: string | null;
  /** Normalised release version ("5.61.1"), or null when unscheduled. */
  release: string | null;
  flagged: boolean;
};

// ── Property extraction ─────────────────────────────────────────────────────

function joinRichText(parts: RichText[] | undefined): string {
  return (parts ?? []).map((p) => p.plain_text ?? "").join("");
}

/** Plain-text value of any scalar-ish Notion property, trimmed; null if empty. */
export function propText(prop: NotionProperty | undefined): string | null {
  if (!prop) return null;
  let value: string | null | undefined;
  switch (prop.type) {
    case "title":
      value = joinRichText(prop.title);
      break;
    case "rich_text":
      value = joinRichText(prop.rich_text);
      break;
    case "url":
      value = prop.url;
      break;
    case "select":
      value = prop.select?.name;
      break;
    case "status":
      value = prop.status?.name;
      break;
    case "date":
      value = prop.date?.start;
      break;
    default:
      value = null;
  }
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function propNames(prop: NotionProperty | undefined): string[] {
  if (!prop || prop.type !== "multi_select") return [];
  return (prop.multi_select ?? [])
    .map((o) => (o.name ?? "").trim())
    .filter(Boolean);
}

/** Every http(s) URL in a free-text value, in order, deduplicated. */
export function extractUrls(text: string | null): string[] {
  if (!text) return [];
  const matches = text.match(/https?:\/\/[^\s,;<>"')\]]+/gi) ?? [];
  return dedupe(matches.map((u) => u.replace(/[.]+$/, "")));
}

export function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}

export function mapStatus(internal: string | null): PublicStatus | null {
  if (!internal) return null;
  const key = internal.trim().toLowerCase();
  return key in STATUS_MAP ? STATUS_MAP[key] : null;
}

export function isKnownStatus(internal: string | null): boolean {
  return !!internal && internal.trim().toLowerCase() in STATUS_MAP;
}

export function mapTimeframe(when: string | null): Timeframe | null {
  if (!when) return null;
  const key = when.trim().toLowerCase() as Timeframe;
  return TIMEFRAMES.includes(key) ? key : null;
}

/** ISO date (YYYY-MM-DD) from a Notion date start, or null. */
function toDateOnly(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

export function mapNotionPage(page: NotionPage): RoadmapRow {
  const p = page.properties ?? {};
  const internalStatus = propText(p[NOTION_PROPS.status]);
  const githubProp = p[NOTION_PROPS.githubLinks];
  const name = propText(p[NOTION_PROPS.name]);

  return {
    notionPageId: page.id,
    notionUrl: page.url ?? null,
    internalName: name ?? "(untitled)",
    publicTitle: name,
    publicDescription: propText(p[NOTION_PROPS.publicDescription]),
    internalStatus,
    publicStatus: mapStatus(internalStatus),
    timeframe: mapTimeframe(propText(p[NOTION_PROPS.when])),
    deliveryQuarter: propText(p[NOTION_PROPS.deliveryQuarter]),
    squads: propNames(p[NOTION_PROPS.squad]),
    tags: propNames(p[NOTION_PROPS.tags]),
    cannyUrl: propText(p[NOTION_PROPS.cannyLink]),
    githubLinks: extractUrls(propText(githubProp)),
    docsLink: propText(p[NOTION_PROPS.docsLink]),
    publicReviewDate: toDateOnly(propText(p[NOTION_PROPS.publicReviewDate])),
    release: normalizeVersion(propText(p[NOTION_PROPS.release])),
    flagged: p[NOTION_PROPS.publicRoadmap]?.checkbox === true,
  };
}

/**
 * The only Notion-derived values that are ever written to Strapi. An explicit
 * allow-list: internal status/comments etc. have no path to storage.
 */
export function toPublicFields(row: RoadmapRow) {
  return {
    public_title: row.publicTitle,
    public_description: row.publicDescription,
    public_status: row.publicStatus,
    timeframe: row.timeframe,
    delivery_quarter: row.deliveryQuarter,
    squads: row.squads,
    tags: row.tags,
    canny_url: row.cannyUrl,
    docs_link: row.docsLink,
    public_review_date: row.publicReviewDate,
    release: row.release,
  };
}

// ── Validation (fail closed) ────────────────────────────────────────────────

export type BlockingReason =
  | "not_flagged"
  | "archived"
  | "missing_title"
  | "missing_description"
  | "paused"
  | "unmapped_status"
  | "broken_link";

/** Outcome of checking one link: ok, definitively broken, or unknown. */
export type LinkCheck = {
  url: string;
  result: "ok" | "broken" | "unverified";
  httpStatus?: number;
  /** GitHub issue/PR state when the link is a GitHub issue or PR. */
  state?: "open" | "closed" | "merged";
  kind?: "issue" | "pull_request" | "link";
  error?: string;
};

export function blockingReasons(
  row: RoadmapRow,
  linkChecks: LinkCheck[],
  archived = false,
): BlockingReason[] {
  const reasons: BlockingReason[] = [];
  if (!row.flagged) reasons.push("not_flagged");
  if (archived) reasons.push("archived");
  if (!row.publicTitle) reasons.push("missing_title");
  if (!row.publicDescription) reasons.push("missing_description");
  if (!isKnownStatus(row.internalStatus)) reasons.push("unmapped_status");
  else if (row.publicStatus === null) reasons.push("paused");
  if (linkChecks.some((c) => c.result === "broken"))
    reasons.push("broken_link");
  return reasons;
}

export function isStale(
  reviewDate: string | null,
  now: Date,
  days = STALE_AFTER_DAYS,
): boolean {
  if (!reviewDate) return true;
  const reviewed = Date.parse(`${reviewDate}T00:00:00Z`);
  if (Number.isNaN(reviewed)) return true;
  return now.getTime() - reviewed > days * 24 * 60 * 60 * 1000;
}

// ── Slugs & URL parsing ─────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** First free slug: `base`, `base-2`, `base-3`… */
export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = base || "roadmap-item";
  if (!taken.has(root)) return root;
  let n = 2;
  while (taken.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}

/**
 * Canny post URLs look like `https://<host>/<board>/p/<post>` (public,
 * custom domain) or `https://<co>.canny.io/admin/board/<board>/p/<post>`.
 */
export function parseCannyUrl(
  raw: string,
): { boardUrlName: string; postUrlName: string } | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  // The URL is rendered as a link on the public page: http(s) only.
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const parts = url.pathname.split("/").filter(Boolean);
  const p = parts.lastIndexOf("p");
  if (p < 1 || p === parts.length - 1) return null;
  return { boardUrlName: parts[p - 1], postUrlName: parts[p + 1] };
}

/**
 * "v5.61.1", "5.61", "Strapi v5.61.1 (Nov 4)" → "5.61.1" / "5.61". Anything
 * without a version number → null. Matches GitHub tags and milestone titles.
 */
export function normalizeVersion(raw: string | null): string | null {
  const match = raw?.match(/(\d+\.\d+(?:\.\d+)?)/);
  return match ? match[1] : null;
}

/** Numeric semver-ish compare: "5.9" < "5.10" < "5.10.1". */
export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function parseGitHubIssueUrl(
  raw: string,
): { owner: string; repo: string; number: number } | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.hostname.replace(/^www\./, "") !== "github.com") return null;
  const match = url.pathname.match(/^\/([^/]+)\/([^/]+)\/(issues|pull)\/(\d+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2], number: Number(match[4]) };
}

// ── Network safety ──────────────────────────────────────────────────────────

/**
 * Destinations the link checker must never connect to. node:net's BlockList
 * parses every IPv6 spelling (hex or dotted v4-mapped, compressed, etc.), and
 * IPv4 rules also match their ::ffff: mapped forms. The IPv6 rules cover
 * ranges that embed or tunnel to IPv4 (v4-compatible, NAT64, 6to4, Teredo).
 */
const BLOCKED = new BlockList();
for (const [net, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8],
  ["169.254.0.0", 16], // link-local, incl. cloud metadata 169.254.169.254
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 3], // multicast + reserved + broadcast
] as const) {
  BLOCKED.addSubnet(net, prefix, "ipv4");
}
for (const [net, prefix] of [
  ["::", 96], // unspecified, loopback, v4-compatible
  ["64:ff9b::", 96], // NAT64
  ["64:ff9b:1::", 48], // local-use NAT64
  ["100::", 64], // discard
  ["2001::", 32], // Teredo
  ["2001:db8::", 32], // documentation
  ["2002::", 16], // 6to4
  ["fc00::", 7], // unique local
  ["fe80::", 10], // link-local
  ["fec0::", 10], // site-local (deprecated)
  ["ff00::", 8], // multicast
] as const) {
  BLOCKED.addSubnet(net, prefix, "ipv6");
}

/** True for any address we refuse to connect to, or anything not an IP. */
export function isPrivateAddress(ip: string): boolean {
  const family = isIP(ip);
  if (family === 0) return true;
  return BLOCKED.check(ip, family === 4 ? "ipv4" : "ipv6");
}

/** Stable JSON for change detection (key order independent). */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

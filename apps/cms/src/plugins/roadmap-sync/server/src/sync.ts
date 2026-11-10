import { triggerN8nWebhook } from "../../../moderation/server/src/services/n8n-webhook";
import {
  type BlockingReason,
  blockingReasons,
  type LinkCheck,
  mapNotionPage,
  type RoadmapRow,
  slugify,
  stableStringify,
  toPublicFields,
  uniqueSlug,
} from "./lib/rules";
import { createCannyClient } from "./services/canny";
import { checkLink } from "./services/links";
import { queryPublicRoadmapPages } from "./services/notion";
import { fetchReleases } from "./services/releases";

const RELEASE_UID = "api::release.release" as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T|$)/;

/** Equality that treats "…52Z" and "…52.000Z" (Strapi vs GitHub) as equal. */
function sameValue(a: unknown, b: unknown): boolean {
  const norm = (v: unknown) => (v === undefined || v === "" ? null : v);
  const x = norm(a);
  const y = norm(b);
  if (typeof x === "string" && typeof y === "string" && ISO_DATE.test(x)) {
    return Date.parse(x) === Date.parse(y);
  }
  return x === y;
}

/**
 * Upsert GitHub releases + open milestones into api::release. Returns every
 * version Strapi knows about afterwards. Failure is non-fatal: items keep
 * syncing, the last known release list stays, and the run reports it.
 */
async function syncReleases(
  report: SyncReport,
  referenced: Iterable<string>,
): Promise<Set<string>> {
  const existing = await strapi.documents(RELEASE_UID).findMany({
    limit: 1000,
  });
  const byVersion = new Map(existing.map((r) => [r.version, r]));

  let fetched: Awaited<ReturnType<typeof fetchReleases>>;
  try {
    fetched = await fetchReleases(referenced);
  } catch (err) {
    report.errors.push(`Releases not refreshed: ${(err as Error).message}`);
    return new Set(byVersion.keys());
  }

  const fresh = new Set<string>();
  for (const release of fetched) {
    fresh.add(release.version);
    const current = byVersion.get(release.version);
    if (!current) {
      await strapi.documents(RELEASE_UID).create({ data: release });
      report.releases.created++;
      continue;
    }
    const changed = (Object.keys(release) as (keyof typeof release)[]).some(
      (key) =>
        !sameValue((current as Record<string, unknown>)[key], release[key]),
    );
    if (changed) {
      await strapi.documents(RELEASE_UID).update({
        documentId: current.documentId,
        data: release,
      });
      report.releases.updated++;
    }
  }

  // An upcoming milestone that closed without a matching release (renamed,
  // folded into another version) shouldn't linger as "upcoming". Shipped
  // releases are kept as history.
  for (const [version, current] of byVersion) {
    if (!fresh.has(version) && current.status === "upcoming") {
      await strapi.documents(RELEASE_UID).delete({
        documentId: current.documentId,
      });
      byVersion.delete(version);
      report.releases.removed++;
    }
  }

  return new Set([...byVersion.keys(), ...fresh]);
}

/**
 * Notion → Strapi roadmap sync (spec §5).
 *
 *   1. Pull   — every Notion page with "Public Roadmap" ticked.
 *   2. Enrich — Canny votes/status, GitHub issue state. Additive only.
 *   3. Validate (fail closed) — see `blockingReasons`.
 *   4. Upsert — by notion_page_id, written as a draft.
 *   5. Publish if valid, otherwise unpublish (never delete).
 *   6. Reconcile — published items no longer flagged in Notion → unpublish.
 *   7. Report — needs-attention digest → n8n → Slack.
 *
 * Writes only happen when something changed, so a no-op run leaves every
 * entry (and its publishedAt) untouched.
 */

const UID = "api::roadmap-item.roadmap-item" as const;
const N8N_WEBHOOK_NS = process.env.N8N_WEBHOOK_NAMESPACE || "strapi";
export const REPORT_WEBHOOK_PATH = `${N8N_WEBHOOK_NS}/roadmap-needs-attention`;

type GithubLink = {
  url: string;
  kind?: LinkCheck["kind"];
  state?: LinkCheck["state"];
};

type ExistingItem = {
  documentId: string;
  notion_page_id: string;
  slug: string | null;
  public_title: string | null;
  canny_votes: number | null;
  canny_status: string | null;
  github_links: GithubLink[] | null;
  first_published_at: string | null;
  [key: string]: unknown;
};

type ReportEntry = {
  name: string;
  notion_url: string | null;
  public_url?: string | null;
  detail?: string;
};

export type SyncReport = {
  ok: boolean;
  trigger: string;
  started_at: string;
  finished_at: string;
  notion_rows: number;
  releases: { created: number; updated: number; removed: number };
  counts: {
    created: number;
    updated: number;
    published: number;
    unpublished: number;
    unchanged: number;
    blocked: number;
    live: number;
  };
  needs_attention: {
    missing_title: ReportEntry[];
    missing_description: ReportEntry[];
    paused: ReportEntry[];
    unmapped_status: ReportEntry[];
    broken_links: ReportEntry[];
    unverified_links: ReportEntry[];
    canny_unavailable: ReportEntry[];
    held_until_verified: ReportEntry[];
    unknown_release: ReportEntry[];
    unpublished: ReportEntry[];
  };
  errors: string[];
  summary_text?: string;
};

const ITEM_FIELDS = [
  "documentId",
  "notion_page_id",
  "slug",
  "public_title",
  "public_description",
  "public_status",
  "timeframe",
  "delivery_quarter",
  "squads",
  "tags",
  "canny_url",
  "canny_votes",
  "canny_status",
  "github_links",
  "docs_link",
  "release",
  "first_published_at",
] as const;

function publicUrl(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const base = (
    process.env.WEBSITE_URL || "https://community.strapi.io"
  ).replace(/\/$/, "");
  return `${base}/roadmap/${encodeURIComponent(slug)}`;
}

function entry(row: RoadmapRow, extra: Partial<ReportEntry> = {}): ReportEntry {
  return { name: row.internalName, notion_url: row.notionUrl, ...extra };
}

function emptyReport(trigger: string, startedAt: Date): SyncReport {
  return {
    ok: true,
    trigger,
    started_at: startedAt.toISOString(),
    finished_at: startedAt.toISOString(),
    notion_rows: 0,
    releases: { created: 0, updated: 0, removed: 0 },
    counts: {
      created: 0,
      updated: 0,
      published: 0,
      unpublished: 0,
      unchanged: 0,
      blocked: 0,
      live: 0,
    },
    needs_attention: {
      missing_title: [],
      missing_description: [],
      paused: [],
      unmapped_status: [],
      broken_links: [],
      unverified_links: [],
      canny_unavailable: [],
      held_until_verified: [],
      unknown_release: [],
      unpublished: [],
    },
    errors: [],
  };
}

/** Comparable view of an entry's synced fields (for change detection). */
function syncedView(item: Record<string, unknown>) {
  const view: Record<string, unknown> = {};
  for (const field of ITEM_FIELDS) {
    if (field === "documentId" || field === "first_published_at") continue;
    const value = item[field];
    view[field] = value === undefined || value === "" ? null : value;
  }
  return view;
}

async function loadExisting() {
  const [drafts, published] = await Promise.all([
    strapi.documents(UID).findMany({
      status: "draft",
      fields: [...ITEM_FIELDS],
      pagination: { pageSize: 1000 },
    }),
    strapi.documents(UID).findMany({
      status: "published",
      fields: ["documentId"],
      pagination: { pageSize: 1000 },
    }),
  ]);
  return {
    byNotionId: new Map(
      (drafts as unknown as ExistingItem[]).map((d) => [d.notion_page_id, d]),
    ),
    publishedIds: new Set(published.map((p) => p.documentId)),
    slugs: new Set(
      (drafts as unknown as ExistingItem[])
        .map((d) => d.slug)
        .filter((s): s is string => Boolean(s)),
    ),
  };
}

async function syncRow(
  row: RoadmapRow,
  archived: boolean,
  ctx: {
    existing: ExistingItem | undefined;
    isPublished: boolean;
    slugs: Set<string>;
    canny: ReturnType<typeof createCannyClient>;
    report: SyncReport;
    now: Date;
  },
) {
  const { existing, isPublished, report, now } = ctx;
  const attention = report.needs_attention;

  // ── Enrich + validate links ────────────────────────────────────────────
  const linkChecks: LinkCheck[] = [];
  for (const url of row.githubLinks) linkChecks.push(await checkLink(url));
  if (row.docsLink) linkChecks.push(await checkLink(row.docsLink));

  let cannyPatch: { canny_votes?: number; canny_status?: string | null } = {};
  let cannyUnavailable = false;
  if (row.cannyUrl) {
    const canny = await ctx.canny.getPost(row.cannyUrl);
    if (canny.result === "ok") {
      cannyPatch = { canny_votes: canny.votes, canny_status: canny.status };
    } else if (canny.result === "not_found") {
      linkChecks.push({
        url: row.cannyUrl,
        result: "broken",
        error: canny.error,
      });
    } else {
      // Keep the last cached votes/status; just flag it.
      cannyUnavailable = true;
      attention.canny_unavailable.push(entry(row, { detail: canny.error }));
    }
  } else {
    cannyPatch = { canny_votes: 0, canny_status: null };
  }

  const previousLinks = new Map(
    (existing?.github_links ?? []).map((l) => [l.url, l]),
  );
  const githubLinks: GithubLink[] = row.githubLinks.map((url) => {
    const check = linkChecks.find((c) => c.url === url);
    if (check?.result === "ok") {
      return { url, kind: check.kind, state: check.state };
    }
    // Unverified this run: keep whatever state we last knew.
    const prev = previousLinks.get(url);
    return { url, kind: prev?.kind, state: prev?.state };
  });

  for (const check of linkChecks) {
    const detail = `${check.url} (${check.httpStatus ?? check.error ?? "?"})`;
    if (check.result === "broken")
      attention.broken_links.push(entry(row, { detail }));
    if (check.result === "unverified")
      attention.unverified_links.push(entry(row, { detail }));
  }

  const reasons = blockingReasons(row, linkChecks, archived);
  const reasonBuckets: Partial<Record<BlockingReason, ReportEntry[]>> = {
    missing_title: attention.missing_title,
    missing_description: attention.missing_description,
    paused: attention.paused,
    unmapped_status: attention.unmapped_status,
  };
  for (const reason of reasons) {
    reasonBuckets[reason]?.push(
      entry(
        row,
        reason === "unmapped_status"
          ? { detail: row.internalStatus ?? "(empty)" }
          : {},
      ),
    );
  }
  const valid = reasons.length === 0;

  // A link we couldn't check this run (rate limit, outage) can't take an
  // item live — it might be dead — but it can't take a live item down
  // either, or every GitHub/Canny hiccup would empty the roadmap.
  const unverified =
    cannyUnavailable || linkChecks.some((c) => c.result === "unverified");
  const publishable = valid && (isPublished || !unverified);
  if (valid && !publishable) {
    attention.held_until_verified.push(entry(row));
  }

  // ── Build data ─────────────────────────────────────────────────────────
  const data: Record<string, unknown> = {
    notion_page_id: row.notionPageId,
    ...toPublicFields(row),
    github_links: githubLinks,
    ...cannyPatch,
  };

  // Slugs are permalinks: frozen once an item has ever been published. Until
  // then they follow the public title, falling back to an opaque id.
  const everPublished = Boolean(existing?.first_published_at);
  const current = existing?.slug ?? null;
  const wanted =
    (row.publicTitle && slugify(row.publicTitle)) ||
    `item-${row.notionPageId.slice(0, 8)}`;
  // `wanted` is [a-z0-9-] only, so it is safe inside a RegExp.
  const alreadyMatches =
    current !== null && new RegExp(`^${wanted}(-\\d+)?$`).test(current);
  if (!current || (!everPublished && !alreadyMatches)) {
    if (current) ctx.slugs.delete(current);
    data.slug = uniqueSlug(wanted, ctx.slugs);
    ctx.slugs.add(data.slug as string);
  }

  if (publishable && !everPublished) {
    data.first_published_at = now.toISOString();
  }

  const changed =
    !existing ||
    data.slug !== undefined ||
    data.first_published_at !== undefined ||
    stableStringify(syncedView({ ...existing, ...data })) !==
      stableStringify(syncedView(existing));

  // ── Write ──────────────────────────────────────────────────────────────
  let documentId = existing?.documentId;
  if (!existing) {
    const created = await strapi.documents(UID).create({
      // biome-ignore lint/suspicious/noExplicitAny: `data` is built field by field; a new item always carries the required ones
      data: { ...data, last_synced_at: now.toISOString() } as any,
    });
    documentId = created.documentId;
    report.counts.created++;
  } else if (changed) {
    await strapi.documents(UID).update({
      documentId: existing.documentId,
      data: { ...data, last_synced_at: now.toISOString() },
    });
    report.counts.updated++;
  }

  const slug = (data.slug as string | undefined) ?? existing?.slug ?? null;

  if (publishable) {
    if (changed || !isPublished) {
      await strapi.documents(UID).publish({ documentId: documentId! });
      report.counts.published++;
    } else {
      report.counts.unchanged++;
    }
    report.counts.live++;
  } else {
    report.counts.blocked++;
    // (`isPublished` here implies `!valid`: unverified alone never unpublishes.)
    if (isPublished) {
      await strapi.documents(UID).unpublish({ documentId: documentId! });
      report.counts.unpublished++;
      attention.unpublished.push(
        entry(row, { public_url: publicUrl(slug), detail: reasons.join(", ") }),
      );
    } else if (!changed) {
      report.counts.unchanged++;
    }
  }
}

function summaryText(report: SyncReport): string {
  const a = report.needs_attention;
  const c = report.counts;
  const link = (e: ReportEntry) =>
    e.notion_url ? `<${e.notion_url}|${e.name}>` : e.name;
  const section = (title: string, entries: ReportEntry[]) =>
    entries.length
      ? [
          `*${title}* (${entries.length})`,
          ...entries
            .slice(0, 15)
            .map((e) => `• ${link(e)}${e.detail ? ` — ${e.detail}` : ""}`),
          ...(entries.length > 15
            ? [`• …and ${entries.length - 15} more`]
            : []),
        ].join("\n")
      : null;

  const lines = [
    !report.ok
      ? ":rotating_light: *Public roadmap sync failed* — nothing was published or unpublished"
      : report.notion_rows === 0
        ? ":warning: *Public roadmap sync skipped* — Notion returned no flagged items"
        : `:world_map: *Public roadmap sync* — ${c.live} live, ${c.blocked} held back as drafts`,
    ...report.errors.map((e) => `> ${e}`),
    section("Unpublished this run", a.unpublished),
    section("Missing public title", a.missing_title),
    section("Missing public description", a.missing_description),
    section("Broken links", a.broken_links),
    section("Status not mapped", a.unmapped_status),
    section("Paused (flagged but hidden)", a.paused),
    section("Links we couldn't verify", a.unverified_links),
    section(
      "Ready, but held until its links can be verified",
      a.held_until_verified,
    ),
    section("Canny unavailable (kept cached votes)", a.canny_unavailable),
    section("Release not found on GitHub", a.unknown_release),
  ];
  return lines.filter(Boolean).join("\n\n");
}

let running: Promise<SyncReport> | null = null;

export function isSyncRunning(): boolean {
  return running !== null;
}

/**
 * Run one sync. Concurrent calls share the in-flight run rather than
 * racing each other on the same documents.
 */
export function runRoadmapSync(
  opts: { trigger?: string; sendReport?: boolean } = {},
): Promise<SyncReport> {
  running ??= doSync(opts).finally(() => {
    running = null;
  });
  return running;
}

async function doSync({
  trigger = "manual",
  sendReport = false,
}: {
  trigger?: string;
  sendReport?: boolean;
}): Promise<SyncReport> {
  const now = new Date();
  const report = emptyReport(trigger, now);
  strapi.log.info(`[roadmap-sync] Starting (${trigger})`);

  try {
    const pages = await queryPublicRoadmapPages();
    report.notion_rows = pages.length;

    const { byNotionId, publishedIds, slugs } = await loadExisting();
    const rows = pages.map((page) => ({ page, row: mapNotionPage(page) }));
    const knownReleases = await syncReleases(
      report,
      rows.flatMap(({ row }) => (row.release ? [row.release] : [])),
    );
    const canny = createCannyClient();
    const seen = new Set<string>();

    for (const { page, row } of rows) {
      seen.add(row.notionPageId);
      // Not blocking: a version that isn't a GitHub release or open
      // milestone yet still shows on the card, just without a date.
      if (row.release && !knownReleases.has(row.release)) {
        report.needs_attention.unknown_release.push(
          entry(row, {
            detail: `${row.release} isn't a GitHub release or open milestone`,
          }),
        );
      }
      const existing = byNotionId.get(row.notionPageId);
      try {
        await syncRow(row, Boolean(page.archived || page.in_trash), {
          existing,
          isPublished: existing ? publishedIds.has(existing.documentId) : false,
          slugs,
          canny,
          report,
          now,
        });
      } catch (err) {
        report.errors.push(`${row.internalName}: ${(err as Error).message}`);
        strapi.log.error(
          `[roadmap-sync] Failed on '${row.internalName}' (${row.notionPageId}): ${err}`,
        );
      }
    }

    // ── Reconcile: published here, no longer flagged in Notion ───────────
    const orphans = [...byNotionId.values()].filter(
      (item) =>
        !seen.has(item.notion_page_id) && publishedIds.has(item.documentId),
    );
    if (pages.length === 0 && orphans.length > 0) {
      // An empty pull while items are live is far more likely to be a
      // revoked share / wrong data source than a deliberate wipe.
      report.errors.push(
        `Notion returned no flagged rows; left ${orphans.length} live item(s) published. Check the integration's access to the Product Roadmap.`,
      );
    } else {
      for (const item of orphans) {
        await strapi.documents(UID).unpublish({ documentId: item.documentId });
        report.counts.unpublished++;
        report.needs_attention.unpublished.push({
          name: item.public_title ?? item.notion_page_id,
          notion_url: null,
          public_url: publicUrl(item.slug),
          detail: "no longer flagged Public Roadmap in Notion",
        });
      }
    }
  } catch (err) {
    report.ok = false;
    report.errors.push((err as Error).message);
    strapi.log.error(`[roadmap-sync] Aborted: ${err}`);
  }

  report.finished_at = new Date().toISOString();
  report.summary_text = summaryText(report);

  const c = report.counts;
  strapi.log.info(
    `[roadmap-sync] Done (${report.ok ? "ok" : "failed"}) — rows: ${report.notion_rows}, live: ${c.live}, blocked: ${c.blocked}, created: ${c.created}, updated: ${c.updated}, published: ${c.published}, unpublished: ${c.unpublished}, errors: ${report.errors.length}`,
  );

  // Failures and guard trips always report; otherwise only when asked
  // (the weekly digest).
  if (sendReport || !report.ok || report.errors.length > 0) {
    const res = await triggerN8nWebhook(REPORT_WEBHOOK_PATH, report, {
      strapi,
    });
    if (!res.ok) {
      strapi.log.warn(`[roadmap-sync] Report not delivered: ${res.error}`);
    }
  }

  return report;
}

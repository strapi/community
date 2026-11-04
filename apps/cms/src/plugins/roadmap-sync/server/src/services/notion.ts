import { NOTION_PROPS, type NotionPage } from "../lib/rules";

/**
 * Minimal Notion API client: pulls every page of the Product Roadmap data
 * source that has "Public Roadmap" ticked.
 *
 * Unlike the enrichment clients this one THROWS on failure — the sync must
 * abort rather than reconcile against an empty/partial pull (which would
 * unpublish the whole roadmap).
 *
 * Env:
 *   NOTION_API_TOKEN       — internal integration token, shared with the DB.
 *   NOTION_DATA_SOURCE_ID  — the Product Roadmap *data source* id (not the
 *                            database id; API version 2025-09-03 queries
 *                            data sources).
 *   NOTION_API_BASE_URL    — optional override (local fake API).
 */

const NOTION_VERSION = "2025-09-03";
const PAGE_SIZE = 100;
const MAX_RETRIES = 3;

export function isNotionConfigured(): boolean {
  return Boolean(
    process.env.NOTION_API_TOKEN && process.env.NOTION_DATA_SOURCE_ID,
  );
}

function baseUrl(): string {
  return (process.env.NOTION_API_BASE_URL || "https://api.notion.com").replace(
    /\/$/,
    "",
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function postWithRetry(url: string, body: unknown): Promise<any> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });

    // Notion rate-limits at ~3 req/s and says how long to back off.
    if (res.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = Number(res.headers.get("retry-after")) || 1;
      await sleep(retryAfter * 1000);
      continue;
    }

    const data: any = await res.json().catch(() => null);
    if (!res.ok) {
      const detail = data?.message ? `: ${data.code} — ${data.message}` : "";
      throw new Error(`Notion returned ${res.status}${detail}`);
    }
    return data;
  }
}

export async function queryPublicRoadmapPages(): Promise<NotionPage[]> {
  if (!isNotionConfigured()) {
    throw new Error(
      "NOTION_API_TOKEN / NOTION_DATA_SOURCE_ID are not configured.",
    );
  }

  const url = `${baseUrl()}/v1/data_sources/${process.env.NOTION_DATA_SOURCE_ID}/query`;
  const pages: NotionPage[] = [];
  let cursor: string | undefined;

  do {
    const data = await postWithRetry(url, {
      filter: {
        property: NOTION_PROPS.publicRoadmap,
        checkbox: { equals: true },
      },
      page_size: PAGE_SIZE,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    if (!Array.isArray(data?.results)) {
      throw new Error("Notion returned an unexpected query response shape.");
    }
    pages.push(...data.results.filter((r: any) => r?.object === "page"));
    cursor = data.has_more ? (data.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return pages;
}

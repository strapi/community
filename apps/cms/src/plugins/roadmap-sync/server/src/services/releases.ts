import { getGitHubHeaders } from "../../../../package-info/server/src/services/github";
import { normalizeVersion } from "../lib/rules";

/**
 * Strapi's release calendar, straight from GitHub:
 *   - shipped:  published (non-draft, non-prerelease) GitHub releases
 *   - upcoming: open milestones whose title is a version ("5.61.1")
 *
 * Both are public on github.com/strapi/strapi, so nothing here can leak.
 * Throws on failure; the sync treats a release-fetch failure as non-fatal
 * for the roadmap items themselves.
 *
 * Env: ROADMAP_RELEASES_REPO (default "strapi/strapi"), GITHUB_ACCESS_TOKEN.
 */

export type ReleaseRecord = {
  version: string;
  status: "upcoming" | "released";
  released_at: string | null;
  due_on: string | null;
  url: string | null;
  open_issues: number | null;
  closed_issues: number | null;
};

const RECENT_RELEASES = 12;

function repo(): string {
  return process.env.ROADMAP_RELEASES_REPO || "strapi/strapi";
}

async function getJson(path: string): Promise<any[]> {
  const res = await fetch(`https://api.github.com/repos/${repo()}/${path}`, {
    headers: getGitHubHeaders(),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`GitHub ${path} returned ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(`GitHub ${path}: unexpected shape`);
  return data;
}

export async function fetchReleases(): Promise<ReleaseRecord[]> {
  const [releases, milestones] = await Promise.all([
    getJson(`releases?per_page=${RECENT_RELEASES * 2}`),
    getJson("milestones?state=open&per_page=30"),
  ]);

  const byVersion = new Map<string, ReleaseRecord>();

  for (const r of releases) {
    if (r?.draft || r?.prerelease) continue;
    const version = normalizeVersion(r?.tag_name ?? r?.name ?? null);
    if (!version || byVersion.has(version)) continue;
    byVersion.set(version, {
      version,
      status: "released",
      released_at: r.published_at ?? null,
      due_on: null,
      url: r.html_url ?? null,
      open_issues: null,
      closed_issues: null,
    });
    if (byVersion.size >= RECENT_RELEASES) break;
  }

  for (const m of milestones) {
    const version = normalizeVersion(m?.title ?? null);
    // A milestone for a version that already shipped is just housekeeping.
    if (!version || byVersion.has(version)) continue;
    byVersion.set(version, {
      version,
      status: "upcoming",
      released_at: null,
      due_on: typeof m.due_on === "string" ? m.due_on.slice(0, 10) : null,
      url: m.html_url ?? null,
      open_issues: typeof m.open_issues === "number" ? m.open_issues : null,
      closed_issues:
        typeof m.closed_issues === "number" ? m.closed_issues : null,
    });
  }

  return [...byVersion.values()];
}

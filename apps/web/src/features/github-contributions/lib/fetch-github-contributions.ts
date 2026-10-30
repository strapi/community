import "server-only";

import type { GithubContributions } from "./types";

/** How long a profile's GitHub contributions are cached. */
const GITHUB_CONTRIBUTIONS_REVALIDATE = 30 * 60;

/**
 * Fetches a user's GitHub contributions through Next's data cache, so
 * GitHub is only hit once per user per `GITHUB_CONTRIBUTIONS_REVALIDATE`
 * — the catch-all route is `force-dynamic`, which only leaves fetches
 * uncached when they set no cache options of their own. A plain `fetch`
 * rather than `cmsClient.fetch`, which rebuilds the request internally and
 * drops the `next` option. Only 200 responses are cached; the CMS answers
 * a GitHub failure with a 502, so that's retried on the next render.
 */
export async function fetchGithubContributions(
  userId: number | string,
): Promise<GithubContributions | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_CMS_URL}/api/users/${userId}/github-contributions`,
      {
        headers: { Authorization: `Bearer ${process.env.CMS_BEARER_TOKEN}` },
        next: { revalidate: GITHUB_CONTRIBUTIONS_REVALIDATE },
      },
    );
    if (!res.ok) return null;

    const body = (await res.json()) as { data: GithubContributions | null };
    return body.data;
  } catch {
    // Optional extra — a GitHub/CMS hiccup shouldn't take the page down.
    return null;
  }
}

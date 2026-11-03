import { getGitHubHeaders } from "../../../../package-info/server/src/services/github";
import { type LinkCheck, parseGitHubIssueUrl } from "../lib/rules";

/**
 * Link validation for roadmap items. Never throws.
 *
 *   ok          — 2xx.
 *   broken      — definitively dead (404/410) or not an http(s) URL. Blocks
 *                 publishing: the proposal's "every link resolves" gate.
 *   unverified  — anything else (rate limit, 5xx, timeout, bot wall). Does NOT
 *                 block: a GitHub hiccup must not unpublish the roadmap. It is
 *                 listed in the needs-attention report instead.
 *
 * GitHub issue/PR links go through the GitHub API (reusing package-info's
 * GITHUB_ACCESS_TOKEN headers) so we also get open/closed/merged state.
 */

const TIMEOUT_MS = 10_000;
const DEAD = new Set([404, 410]);

function isHttpUrl(raw: string): boolean {
  try {
    const { protocol } = new URL(raw);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

function classify(url: string, status: number): LinkCheck {
  if (status >= 200 && status < 300)
    return { url, result: "ok", httpStatus: status };
  if (DEAD.has(status)) return { url, result: "broken", httpStatus: status };
  return { url, result: "unverified", httpStatus: status };
}

async function checkGitHubIssue(
  url: string,
  ref: { owner: string; repo: string; number: number },
): Promise<LinkCheck> {
  const res = await fetch(
    `https://api.github.com/repos/${ref.owner}/${ref.repo}/issues/${ref.number}`,
    { headers: getGitHubHeaders(), signal: AbortSignal.timeout(TIMEOUT_MS) },
  );
  const check = classify(url, res.status);
  if (check.result !== "ok") return check;

  const data: any = await res.json();
  const isPr = Boolean(data?.pull_request);
  return {
    ...check,
    kind: isPr ? "pull_request" : "issue",
    state: data?.pull_request?.merged_at
      ? "merged"
      : data?.state === "closed"
        ? "closed"
        : "open",
  };
}

async function checkHttp(url: string): Promise<LinkCheck> {
  const init = {
    redirect: "follow" as const,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "User-Agent": "strapi-community-roadmap-sync" },
  };
  let res = await fetch(url, { ...init, method: "HEAD" });
  // Plenty of servers reject HEAD; only trust a negative answer from GET.
  if (!res.ok) res = await fetch(url, { ...init, method: "GET" });
  return { ...classify(url, res.status), kind: "link" };
}

export async function checkLink(url: string): Promise<LinkCheck> {
  if (!isHttpUrl(url)) {
    return { url, result: "broken", error: "Not an http(s) URL" };
  }
  try {
    const gh = parseGitHubIssueUrl(url);
    return gh ? await checkGitHubIssue(url, gh) : await checkHttp(url);
  } catch (err) {
    return { url, result: "unverified", error: (err as Error).message };
  }
}

import { type LookupAddress, lookup } from "node:dns";
import http from "node:http";
import https from "node:https";
import { isIP } from "node:net";
import { getGitHubHeaders } from "../../../../package-info/server/src/services/github";
import {
  isPrivateAddress,
  type LinkCheck,
  parseGitHubIssueUrl,
} from "../lib/rules";

/**
 * Link validation for roadmap items. Never throws.
 *
 *   ok          — 2xx.
 *   broken      — definitively dead (404/410), not an http(s) URL, pointing
 *                 at a private network, or a GitHub issue in a private repo.
 *                 Blocks publishing.
 *   unverified  — anything else (rate limit, 5xx, timeout, bot wall). Does NOT
 *                 block on its own; see `publishable` in sync.ts.
 *
 * Safety: URLs come from Notion, so the CMS server must not become a proxy
 * into its own network.
 *   - Non-GitHub links are fetched with node:http(s) and a `lookup` hook, so
 *     the address checked is the address connected to (no DNS-rebinding
 *     window between "check" and "fetch"). Any private/reserved answer fails
 *     the whole lookup. Literal-IP hosts are checked up front.
 *   - Redirects are followed by hand; every hop goes through the same checks.
 *   - Only ports 80/443, no credentials in URLs.
 *   - GitHub lookups use our token, so a link into a private repo (directly,
 *     or via an issue transferred there) would otherwise "validate" and
 *     publish its state; those are refused.
 */

const TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 5;
const DEAD = new Set([404, 410]);

class UnsafeUrlError extends Error {}

// ── Address checks ─────────────────────────────────────────────────────────

/** Scheme, port, credentials and literal-IP checks. DNS names are checked
 * at connect time by `safeLookup`. */
function assertSafeUrl(url: URL): void {
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new UnsafeUrlError("Not an http(s) URL");
  }
  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new UnsafeUrlError(`Port ${url.port} not allowed`);
  }
  if (url.username || url.password) {
    throw new UnsafeUrlError("Credentials in URL not allowed");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host) && isPrivateAddress(host)) {
    throw new UnsafeUrlError("Private or reserved address");
  }
}

/**
 * `lookup` for http.request: resolves, refuses if ANY answer is private, and
 * hands the vetted addresses straight to the socket.
 */
function safeLookup(
  hostname: string,
  options: { all?: boolean; family?: number },
  callback: (
    err: NodeJS.ErrnoException | null,
    address: string | LookupAddress[],
    family?: number,
  ) => void,
): void {
  lookup(hostname, { all: true, verbatim: true }, (err, addresses) => {
    if (err) return callback(err, []);
    if (
      addresses.length === 0 ||
      addresses.some((a) => isPrivateAddress(a.address))
    ) {
      return callback(
        new UnsafeUrlError("Resolves to a private or reserved address"),
        [],
      );
    }
    if (options?.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
}

// ── Checks ─────────────────────────────────────────────────────────────────

function classify(url: string, status: number): LinkCheck {
  if (status >= 200 && status < 300)
    return { url, result: "ok", httpStatus: status };
  if (DEAD.has(status)) return { url, result: "broken", httpStatus: status };
  return { url, result: "unverified", httpStatus: status };
}

/** Repo visibility, cached briefly so a run checks each repo once. */
const repoVisibility = new Map<string, { isPublic: boolean; at: number }>();
const VISIBILITY_TTL_MS = 10 * 60_000;

async function isPublicRepo(
  owner: string,
  repo: string,
): Promise<boolean | null> {
  const key = `${owner}/${repo}`.toLowerCase();
  const cached = repoVisibility.get(key);
  if (cached && Date.now() - cached.at < VISIBILITY_TTL_MS)
    return cached.isPublic;

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: getGitHubHeaders(),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status === 404) return false;
  if (!res.ok) return null; // unknown (rate limit etc.)
  const data: { private?: boolean; visibility?: string } = await res.json();
  const isPublic = data?.private === false && data?.visibility !== "internal";
  repoVisibility.set(key, { isPublic, at: Date.now() });
  return isPublic;
}

async function checkGitHubIssue(
  url: string,
  ref: { owner: string; repo: string; number: number },
): Promise<LinkCheck> {
  const visible = await isPublicRepo(ref.owner, ref.repo);
  if (visible === false) {
    return { url, result: "broken", error: "Repository is private or missing" };
  }
  if (visible === null) {
    return {
      url,
      result: "unverified",
      error: "Couldn't check repository visibility",
    };
  }

  const res = await fetch(
    `https://api.github.com/repos/${ref.owner}/${ref.repo}/issues/${ref.number}`,
    { headers: getGitHubHeaders(), signal: AbortSignal.timeout(TIMEOUT_MS) },
  );
  const check = classify(url, res.status);
  if (check.result !== "ok") return check;

  const data: {
    repository_url?: string;
    state?: string;
    pull_request?: { merged_at?: string | null };
  } = await res.json();

  // A transferred issue redirects to its new home, which may be private.
  // Check the repo GitHub actually answered from, not the one in the link.
  const actual = String(data?.repository_url ?? "").match(
    /\/repos\/([^/]+)\/([^/]+)$/,
  );
  if (!actual) {
    return { url, result: "unverified", error: "Unexpected issue response" };
  }
  if (
    `${actual[1]}/${actual[2]}`.toLowerCase() !==
    `${ref.owner}/${ref.repo}`.toLowerCase()
  ) {
    const movedVisible = await isPublicRepo(actual[1], actual[2]);
    if (movedVisible === false) {
      return {
        url,
        result: "broken",
        error: "Issue moved to a private repository",
      };
    }
    if (movedVisible === null) {
      return {
        url,
        result: "unverified",
        error: "Couldn't check repository visibility",
      };
    }
  }

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

/** One HTTP exchange, headers only; the body is never read. */
function requestOnce(
  url: URL,
  method: "HEAD" | "GET",
): Promise<{ status: number; location: string | null }> {
  return new Promise((resolve, reject) => {
    const client = url.protocol === "https:" ? https : http;
    const req = client.request(
      url,
      {
        method,
        lookup: safeLookup,
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { "User-Agent": "strapi-community-roadmap-sync" },
      },
      (res) => {
        resolve({
          status: res.statusCode ?? 0,
          location: res.headers.location ?? null,
        });
        res.destroy();
      },
    );
    req.on("error", reject);
    req.end();
  });
}

/** Follow redirects by hand so every hop is re-checked. */
async function request(start: string, method: "HEAD" | "GET"): Promise<number> {
  let current = new URL(start);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    assertSafeUrl(current);
    const { status, location } = await requestOnce(current, method);
    if (status >= 300 && status < 400 && location) {
      current = new URL(location, current);
      continue;
    }
    return status;
  }
  return 310; // too many redirects → unverified
}

async function checkHttp(url: string): Promise<LinkCheck> {
  let status = await request(url, "HEAD");
  // Plenty of servers reject HEAD; only trust a negative answer from GET.
  if (status < 200 || status >= 300) status = await request(url, "GET");
  return { ...classify(url, status), kind: "link" };
}

export async function checkLink(url: string): Promise<LinkCheck> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { url, result: "broken", error: "Not a valid URL" };
  }
  try {
    const gh = parseGitHubIssueUrl(url);
    if (gh) {
      assertSafeUrl(parsed);
      return await checkGitHubIssue(url, gh);
    }
    return await checkHttp(url);
  } catch (err) {
    // Unsafe targets are definitive (the lookup hook's error surfaces here
    // as the request error). Network errors, DNS failures and timeouts are
    // not: they're unverified.
    return {
      url,
      result: err instanceof UnsafeUrlError ? "broken" : "unverified",
      error: (err as Error).message,
    };
  }
}

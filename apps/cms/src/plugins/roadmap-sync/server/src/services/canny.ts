import { parseCannyUrl } from "../lib/rules";

/**
 * Canny enrichment: votes + status for the post a roadmap item links to.
 *
 * Canny's REST API is POST-only with the key in the body. A post is looked up
 * by its board id + url name (`posts/retrieve`), so we list boards once per
 * run and match on the board segment of the link.
 *
 * Never throws. Result is one of:
 *   ok         — fresh votes/status.
 *   not_found  — the board or post definitively doesn't exist (a dead link).
 *   unavailable— network/auth/5xx; caller keeps the last cached values.
 *
 * Env: CANNY_API_KEY, optional CANNY_API_BASE_URL (local fake API).
 */

export type CannyResult =
  | { result: "ok"; votes: number; status: string | null; url: string | null }
  | { result: "not_found"; error: string }
  | { result: "unavailable"; error: string };

type Board = { id: string; name?: string; url?: string };

type CannyResponse = {
  error?: string;
  boards?: Board[];
  score?: unknown;
  status?: unknown;
  url?: unknown;
};

function baseUrl(): string {
  return (process.env.CANNY_API_BASE_URL || "https://canny.io").replace(
    /\/$/,
    "",
  );
}

export function isCannyConfigured(): boolean {
  return Boolean(process.env.CANNY_API_KEY);
}

class CannyError extends Error {
  constructor(
    message: string,
    readonly notFound: boolean,
  ) {
    super(message);
  }
}

async function call(
  path: string,
  body: Record<string, unknown>,
): Promise<CannyResponse | null> {
  const res = await fetch(`${baseUrl()}/api/v1/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: process.env.CANNY_API_KEY, ...body }),
    signal: AbortSignal.timeout(15_000),
  });
  const data: CannyResponse | null = await res.json().catch(() => null);
  if (!res.ok || data?.error) {
    const message = `Canny ${path} returned ${res.status}${data?.error ? `: ${data.error}` : ""}`;
    // Canny reports a missing post as a 4xx with an error string rather than
    // a clean 404, so match on both.
    const notFound =
      res.status === 404 || /not found|does not exist/i.test(data?.error ?? "");
    throw new CannyError(message, notFound);
  }
  return data;
}

/** One client per sync run: caches the board list for the run's duration. */
export function createCannyClient() {
  let boards: Promise<Board[]> | null = null;

  const listBoards = () => {
    boards ??= call("boards/list", {}).then((d) => d?.boards ?? []);
    return boards;
  };

  async function getPost(cannyUrl: string): Promise<CannyResult> {
    const parsed = parseCannyUrl(cannyUrl);
    if (!parsed) {
      return { result: "not_found", error: "Not a Canny post URL" };
    }
    if (!isCannyConfigured()) {
      return { result: "unavailable", error: "CANNY_API_KEY not configured" };
    }

    try {
      const board = (await listBoards()).find((b) =>
        (b.url ?? "").replace(/\/$/, "").endsWith(`/${parsed.boardUrlName}`),
      );
      if (!board) {
        return {
          result: "not_found",
          error: `No Canny board '${parsed.boardUrlName}'`,
        };
      }

      const post = await call("posts/retrieve", {
        boardID: board.id,
        urlName: parsed.postUrlName,
      });
      return {
        result: "ok",
        votes: typeof post?.score === "number" ? post.score : 0,
        status: typeof post?.status === "string" ? post.status : null,
        url: typeof post?.url === "string" ? post.url : null,
      };
    } catch (err) {
      // A failed board listing is cached as a rejected promise; reset it so
      // the next item retries instead of failing for the rest of the run.
      if (!(err instanceof CannyError && err.notFound)) boards = null;
      const error = (err as Error).message;
      return err instanceof CannyError && err.notFound
        ? { result: "not_found", error }
        : { result: "unavailable", error };
    }
  }

  return { getPost };
}

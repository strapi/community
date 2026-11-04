"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { authClient } from "@/features/auth/lib/client";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";
import { getPageContext } from "./page-context-store";
import { pageTypeFromPath } from "./page-type";
import { redactUrl } from "./redact";
import { setGlobalParams, track } from "./track";

/**
 * Query params that change what the page shows. Everything else in the URL
 * (search, filters, sort, the roadmap's ?item and ?view) is tracked as an
 * event, not a page view. Next.js feeds history.replaceState into
 * useSearchParams, so keying on the whole query would fire a page view on
 * every keystroke and filter change. Add a param here only when it swaps the
 * page's main content, as ?tab does.
 */
const PAGE_PARAMS = ["tab"] as const;

type PageParams = Record<(typeof PAGE_PARAMS)[number], string | null>;
type PageKey = { pathname: string; params: PageParams };

/** `logged_in` for every event, and whether the session is known yet. */
const useLoginState = isAuthEnabled
  ? () => {
      const { data, isPending } = authClient.useSession();
      return { known: !isPending, loggedIn: Boolean(data?.user) };
    }
  : () => ({ known: true, loggedIn: false });

/** Pushes `page_view` on each new page. Mount once, in the root layout. */
export const RouteTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { known, loggedIn } = useLoginState();
  const last = useRef<PageKey | null>(null);

  const params = Object.fromEntries(
    PAGE_PARAMS.map((p) => [p, searchParams.get(p)]),
  ) as PageParams;
  const key = JSON.stringify([pathname, params]);

  useEffect(() => {
    if (known) setGlobalParams({ logged_in: loggedIn });
  }, [known, loggedIn]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` stands for pathname and params
  useEffect(() => {
    // Hold the first page view until the session is known, so it carries
    // the right `logged_in`.
    if (!known) return;

    const prev = last.current;
    // On the same path, a page param only makes a new page when it changes
    // from one value to another. Two other changes are not new pages:
    // - missing → value: <Tabs> writes its default ?tab right after the page
    //   view for the bare URL was sent;
    // - value → missing: InstantSearch can drop ?tab for a render before
    //   <Tabs> restores it.
    if (
      prev?.pathname === pathname &&
      PAGE_PARAMS.every(
        (p) =>
          params[p] === null ||
          prev.params[p] === null ||
          params[p] === prev.params[p],
      )
    ) {
      // Remember a filled-in default, so a later switch away from it counts.
      last.current = {
        pathname,
        params: Object.fromEntries(
          PAGE_PARAMS.map((p) => [p, params[p] ?? prev.params[p]]),
        ) as PageParams,
      };
      return;
    }

    // Wait a frame so Next has applied the new <title>.
    const frame = requestAnimationFrame(() => {
      // Set here, not before scheduling, so Strict Mode's effect re-run still
      // sends exactly one page view.
      last.current = { pathname, params };
      track("page_view", {
        page_type: getPageContext()?.page_type ?? pageTypeFromPath(pathname),
        page_location: redactUrl(window.location.href),
        page_path: pathname,
        page_title: document.title,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [key, known]);

  return null;
};

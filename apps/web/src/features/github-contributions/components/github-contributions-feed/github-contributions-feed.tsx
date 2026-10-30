"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CONTRIBUTION_TYPES } from "../../lib/config";
import type { GithubContribution } from "../../lib/types";

const PAGE_SIZE = 20;

const STATE_CLASSNAMES: Record<GithubContribution["state"], string> = {
  open: "bg-(--color-success100) text-(--color-success700)",
  merged: "bg-(--color-primary100) text-(--color-primary700)",
  answered: "bg-(--color-primary100) text-(--color-primary700)",
  closed: "bg-(--color-neutral100) text-(--color-neutral700)",
};

/**
 * The "Recent activity" list of the "GitHub Contributions" tab. The whole
 * list is server-rendered (see `fetchGithubContributions`); "Load more" just reveals the
 * next `PAGE_SIZE` items.
 */
export function GithubContributionsFeed({
  items,
}: {
  items: GithubContribution[];
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  return (
    <>
      <ul className="divide-y divide-(--color-neutral150) rounded-md border border-(--color-neutral150) bg-white">
        {items.slice(0, visibleCount).map((item) => {
          const Icon = CONTRIBUTION_TYPES[item.type].icon;

          return (
            <li key={item.url}>
              <Link
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-(--color-neutral100)"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-(--color-neutral600)" />
                <div className="flex min-w-0 grow flex-col gap-1">
                  <span className="truncate text-md font-medium text-(--color-neutral900)">
                    {item.title}
                  </span>
                  <span className="text-sm text-(--color-neutral600)">
                    {item.repository}#{item.number} ·{" "}
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 rounded-md px-2 py-1 text-xs font-semibold capitalize",
                    STATE_CLASSNAMES[item.state],
                  )}
                >
                  {item.state}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {visibleCount < items.length && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="rounded-md border border-(--color-neutral150) bg-white px-4 py-2 text-sm font-semibold text-(--color-neutral800) transition-colors hover:bg-(--color-neutral100)"
          >
            Load more
          </button>
        </div>
      )}
    </>
  );
}

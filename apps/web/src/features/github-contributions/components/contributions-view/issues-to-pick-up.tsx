"use client";

import { ExternalLink, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getIssuesToPickUp, type IssueToPickUp } from "../../lib/dashboard";

/**
 * Open issues nobody's working on yet (see the CMS's `ISSUES_TO_PICK_UP`):
 * "good first issue"s first, then confirmed low-severity bugs — each with
 * the points a merged fix earns (`reward`). Loaded
 * separately from the rest of the dashboard, so a slow GitHub doesn't
 * hold it up.
 */
export function IssuesToPickUp({ reward }: { reward?: number }) {
  const [issues, setIssues] = useState<IssueToPickUp[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    getIssuesToPickUp()
      .then((data) => active && setIssues(data))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, []);

  if (failed) {
    return (
      <p className="text-sm text-(--color-neutral600)">
        Couldn't load issues right now — try again later.
      </p>
    );
  }

  if (!issues) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true">
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="h-14 animate-pulse rounded-md bg-(--color-neutral100)"
          />
        ))}
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <p className="text-sm text-(--color-neutral600)">
        No open issues to suggest right now — check back soon, or browse the{" "}
        <Link
          href="https://github.com/strapi/strapi/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-(--color-primary600) hover:underline"
        >
          strapi/strapi issues
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="divide-y divide-(--color-neutral150) rounded-md border border-(--color-neutral150)">
      {issues.map((issue) => (
        <li key={issue.url}>
          <Link
            href={issue.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-(--color-neutral100)"
          >
            <div className="flex min-w-0 grow flex-col gap-1.5">
              <span className="text-sm font-medium text-(--color-neutral900)">
                {issue.title}
              </span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--color-neutral600)">
                <span>
                  {issue.repository}#{issue.number}
                </span>
                {issue.kind === "good-first-issue" && (
                  <span className="rounded-md bg-(--color-success100) px-1.5 py-0.5 font-semibold text-(--color-success700)">
                    Good first issue
                  </span>
                )}
                {issue.comments > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" aria-hidden="true" />
                    {issue.comments}
                  </span>
                )}
              </div>
            </div>
            {reward !== undefined && (
              <span className="shrink-0 rounded-full bg-(--color-success100) px-2 py-0.5 text-xs font-bold text-(--color-success700) tabular-nums">
                +{reward}
              </span>
            )}
            <ExternalLink
              className="mt-0.5 h-4 w-4 shrink-0 text-(--color-neutral600) opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

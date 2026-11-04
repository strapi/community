"use client";

import { ArrowUpRight, ChevronUp } from "lucide-react";
import type { RoadmapItem, RoadmapRelease } from "./data";
import { formatDate, githubLinkLabel, githubLinks, stringList } from "./types";

const chip =
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs leading-5";

const ExternalLink = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className={`relative z-10 inline-flex items-center gap-1 text-sm hover:underline ${className}`}
  >
    {children}
    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
  </a>
);

/** Release chip + a date/schedule chip, per the mockup. */
export function scheduleChips(
  item: RoadmapItem,
  release: RoadmapRelease | undefined,
) {
  const shipped = item.public_status === "shipped";
  const when = shipped
    ? release?.released_at
      ? `Shipped ${formatDate(release.released_at, "month")}`
      : "Shipped"
    : (item.delivery_quarter ?? (item.release ? null : "Unscheduled"));
  return { version: item.release ?? null, when };
}

const RoadmapCard = ({
  item,
  release,
  onOpen,
}: {
  item: RoadmapItem;
  release: RoadmapRelease | undefined;
  onOpen: (slug: string) => void;
}) => {
  const areas = stringList(item.squads);
  const [github] = githubLinks(item.github_links);
  const extraGithub = githubLinks(item.github_links).length - 1;
  const { version, when } = scheduleChips(item, release);
  const votes = item.canny_votes ?? 0;

  return (
    <li className="group relative rounded-xl border border-(--color-neutral150) bg-white p-4 shadow-[0_1px_2px_rgba(33,33,52,0.04)] transition-colors focus-within:border-(--color-primary600) hover:border-(--color-primary400) sm:p-5">
      <div className="flex gap-4">
        {item.canny_url && (
          <a
            href={item.canny_url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Upvote on the feedback board (${votes} ${votes === 1 ? "vote" : "votes"})`}
            className="relative z-10 flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-(--color-neutral150) text-(--color-neutral800) transition-colors hover:border-(--color-primary500) hover:bg-(--color-primary100) hover:text-(--color-primary700)"
          >
            <ChevronUp className="h-4 w-4" aria-hidden />
            <span className="text-sm font-semibold tabular-nums leading-none">
              {votes.toLocaleString("en-US")}
            </span>
          </a>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug text-(--color-neutral900)">
            {/* Stretched button: the whole card opens the details dialog,
                while the vote box and footer links stay real links. */}
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => item.slug && onOpen(item.slug)}
              className="text-left after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none group-hover:text-(--color-primary700)"
            >
              {item.public_title}
            </button>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-[11px] uppercase tracking-[0.12em] text-(--color-neutral600)">
            {item.public_status === "beta" && (
              <span className="rounded bg-(--color-warning100) px-1.5 py-px font-sans text-[11px] font-semibold normal-case tracking-normal text-(--color-warning700)">
                Beta
              </span>
            )}
            {areas.join(" · ")}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-(--color-neutral700)">
        {item.public_description}
      </p>

      {(version || when) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {version && (
            <span
              className={`${chip} border-(--color-primary200) bg-(--color-primary100) font-mono text-(--color-primary700)`}
            >
              {version}
            </span>
          )}
          {when && (
            <span
              className={`${chip} border-(--color-neutral150) bg-(--color-neutral100) text-(--color-neutral700)`}
            >
              {when}
            </span>
          )}
        </div>
      )}

      {(github || item.canny_url) && (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-(--color-neutral150) pt-3">
          {github && (
            <ExternalLink
              href={github.url}
              className="font-medium text-(--color-primary600)"
            >
              {githubLinkLabel(github).label} {githubLinkLabel(github).ref}
              {extraGithub > 0 && (
                <span className="text-(--color-neutral600)">
                  {" "}
                  +{extraGithub}
                </span>
              )}
            </ExternalLink>
          )}
          {item.canny_url && (
            <ExternalLink
              href={item.canny_url}
              className="text-(--color-neutral700)"
            >
              Feedback thread
            </ExternalLink>
          )}
        </div>
      )}
    </li>
  );
};

export { RoadmapCard };

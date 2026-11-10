"use client";

import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { RoadmapRelease } from "../lib/data";
import { formatDate, type RoadmapView, UNSCHEDULED } from "../lib/types";

export type FacetOption = { value: string; label: string; count: number };

const RELEASES_URL = "https://github.com/strapi/strapi/releases";

const COLLAPSED_COUNT = 5;

const heading =
  "mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-(--color-neutral600)";

const FacetGroup = ({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: FacetOption[];
  selected: string[];
  onToggle: (value: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  if (options.length === 0) return null;

  const visibleOptions = expanded ? options : options.slice(0, COLLAPSED_COUNT);
  const hasMore = options.length > COLLAPSED_COUNT;

  return (
    <fieldset>
      <legend className={heading}>{title}</legend>
      <ul className="space-y-1">
        {visibleOptions.map((o) => {
          const id = `facet-${title}-${o.value}`.replace(/\W+/g, "-");
          const checked = selected.includes(o.value);
          return (
            <li key={o.value}>
              <label
                htmlFor={id}
                className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-1.5 text-sm text-(--color-neutral800) hover:bg-(--color-neutral100)"
              >
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(o.value)}
                  className="h-4 w-4 rounded border-(--color-neutral300) accent-(--color-primary600)"
                />
                <span
                  className={cn(
                    "flex-1",
                    o.value !== UNSCHEDULED &&
                      title === "Release" &&
                      "font-mono text-[13px]",
                  )}
                >
                  {o.label}
                </span>
                <span className="text-xs tabular-nums text-(--color-neutral600)">
                  {o.count}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 text-sm font-medium text-(--color-primary600) hover:underline"
        >
          {expanded
            ? "Show less"
            : `Show ${options.length - COLLAPSED_COUNT} more`}
        </button>
      )}
    </fieldset>
  );
};

const ReleaseSchedule = ({ releases }: { releases: RoadmapRelease[] }) => {
  if (releases.length === 0) return null;
  return (
    <section aria-labelledby="release-schedule">
      <h2 id="release-schedule" className={heading}>
        Release schedule
      </h2>
      <ol className="space-y-3">
        {releases.map((r) => {
          const upcoming = r.status === "upcoming";
          const total = (r.open_issues ?? 0) + (r.closed_issues ?? 0);
          // No URL = a version only Notion knows about (no GitHub
          // milestone yet), so it's planned rather than in progress.
          const detail = !upcoming
            ? `Released ${formatDate(r.released_at)}`
            : !r.url
              ? "Planned"
              : r.due_on
                ? `Due ${formatDate(r.due_on)}`
                : total > 0
                  ? `In progress · ${r.closed_issues}/${total} issues closed`
                  : "In progress";
          return (
            <li key={r.version} className="flex gap-3">
              <span
                aria-hidden
                className={cn(
                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                  !upcoming
                    ? "bg-(--color-success600)"
                    : r.url
                      ? "bg-(--color-primary400)"
                      : "bg-(--color-primary600)",
                )}
              />
              <div className="min-w-0">
                {r.url ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-sm font-medium text-(--color-neutral900) hover:text-(--color-primary700) hover:underline"
                  >
                    {r.version}
                  </a>
                ) : (
                  <span className="font-mono text-sm font-medium text-(--color-neutral900)">
                    {r.version}
                  </span>
                )}
                <p className="text-xs text-(--color-neutral600)">{detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <a
        href={RELEASES_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-(--color-primary600) hover:underline"
      >
        All releases on GitHub
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </a>
      <p className="mt-4 text-xs leading-5 text-(--color-neutral600)">
        Versions and quarters are targets, not promises. When plans change, this
        page changes with them.
      </p>
    </section>
  );
};

const ViewToggle = ({
  view,
  onChange,
}: {
  view: RoadmapView;
  onChange: (view: RoadmapView) => void;
}) => (
  <div className="flex gap-2">
    {(["board", "timeline"] as const).map((v) => (
      <button
        key={v}
        type="button"
        aria-pressed={view === v}
        onClick={() => onChange(v)}
        className={cn(
          "rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors",
          view === v
            ? "border-(--color-primary600) bg-(--color-primary600) text-white"
            : "border-(--color-neutral300) text-(--color-neutral800) hover:border-(--color-primary500)",
        )}
      >
        {v}
      </button>
    ))}
  </div>
);

const RoadmapSidebar = ({
  view,
  onViewChange,
  releaseOptions,
  areaOptions,
  selectedReleases,
  selectedAreas,
  onToggleRelease,
  onToggleArea,
  onClear,
  schedule,
}: {
  view: RoadmapView;
  onViewChange: (view: RoadmapView) => void;
  releaseOptions: FacetOption[];
  areaOptions: FacetOption[];
  selectedReleases: string[];
  selectedAreas: string[];
  onToggleRelease: (value: string) => void;
  onToggleArea: (value: string) => void;
  onClear: () => void;
  schedule: RoadmapRelease[];
}) => {
  const activeCount = selectedReleases.length + selectedAreas.length;
  const filters = (
    <div className="space-y-7">
      <FacetGroup
        title="Release"
        options={releaseOptions}
        selected={selectedReleases}
        onToggle={onToggleRelease}
      />
      <FacetGroup
        title="Area"
        options={areaOptions}
        selected={selectedAreas}
        onToggle={onToggleArea}
      />
      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-(--color-primary600) hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );

  return (
    <aside className="space-y-7">
      <ViewToggle view={view} onChange={onViewChange} />

      {/* Desktop: always open. Mobile: collapsed behind a toggle. */}
      <div className="hidden lg:block">{filters}</div>
      <details className="rounded-lg border border-(--color-neutral150) lg:hidden">
        <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium text-(--color-neutral800)">
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-(--color-primary100) px-2 text-xs text-(--color-primary700)">
              {activeCount}
            </span>
          )}
        </summary>
        <div className="space-y-7 border-t border-(--color-neutral150) p-4">
          {filters}
          <div className="border-t border-(--color-neutral150) pt-6">
            <ReleaseSchedule releases={schedule} />
          </div>
        </div>
      </details>

      <div className="hidden border-t border-(--color-neutral150) pt-7 lg:block">
        <ReleaseSchedule releases={schedule} />
      </div>
    </aside>
  );
};

export { ReleaseSchedule, RoadmapSidebar };

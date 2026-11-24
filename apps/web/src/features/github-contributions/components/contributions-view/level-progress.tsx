"use client";

import { Check, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getContributorTierConfig } from "../../lib/contributor-tiers";
import type { ContributionsDashboard } from "../../lib/dashboard";
import { getTierProgress, remainingAsContributions } from "../../lib/progress";
import { ContributorTierBadge } from "../contributor-tier-badge";

/**
 * The "level" card at the top of every Community points page: the user's
 * tier and points, every tier as a step on the journey, and an animated
 * bar to the next tier — with what that takes in actual contributions, so
 * the next tier always reads as a reachable goal.
 */
export function LevelProgress({
  dashboard,
  gainPointsHref,
}: {
  dashboard: ContributionsDashboard;
  gainPointsHref: string;
}) {
  const { current, next, remaining, percent } = getTierProgress(dashboard);
  const ways = remainingAsContributions(remaining, dashboard.points);
  const earning = dashboard.status === "active";

  // Fills from 0 after mount, so the bar visibly "charges up".
  const [shownPercent, setShownPercent] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShownPercent(percent));
    return () => cancelAnimationFrame(frame);
  }, [percent]);

  return (
    <section className="flex flex-col gap-5 rounded-lg border border-(--color-primary200) bg-linear-to-br from-(--color-primary100) via-white to-white p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-bold leading-none tracking-tight text-(--color-neutral900) tabular-nums sm:text-5xl">
              {dashboard.score.toLocaleString("en-US")}
            </span>
            <span className="text-sm font-medium text-(--color-neutral600)">
              community points
            </span>
          </div>
          {current ? (
            <ContributorTierBadge tier={current.key} className="mb-5" />
          ) : (
            <span className="mb-5 rounded-full border border-dashed border-(--color-neutral300) px-3 py-1 text-sm font-semibold text-(--color-neutral600)">
              No tier yet
            </span>
          )}
        </div>

        {earning && next && (
          <Link
            href={gainPointsHref}
            className="inline-flex items-center gap-2 rounded-md bg-(--color-primary600) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--color-primary700)"
          >
            <Zap className="h-4 w-4" aria-hidden="true" />
            Gain points
          </Link>
        )}
      </div>

      <TierSteps dashboard={dashboard} />

      {next ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold text-(--color-neutral900)">
              Next: {next.label}
            </span>
            <span className="font-semibold text-(--color-primary600) tabular-nums">
              {remaining.toLocaleString("en-US")}{" "}
              {remaining === 1 ? "point" : "points"} to go
            </span>
          </div>
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-(--color-neutral150)"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(percent)}
            aria-label={`Progress towards ${next.label}`}
          >
            <div
              className="h-full rounded-full bg-linear-to-r from-(--color-primary500) to-(--color-primary700) transition-[width] duration-1000 ease-out"
              style={{
                width: `${Math.max(shownPercent, percent > 0 ? 2 : 0)}%`,
              }}
            />
          </div>
          <p className="text-sm text-(--color-neutral700)">
            {!earning ? (
              "Turn your GitHub contributions back on to earn points."
            ) : ways.length === 0 ? null : dashboard.githubLinked ? (
              <>
                That's just{" "}
                <strong className="text-(--color-neutral900)">{ways[0]}</strong>{" "}
                — or {ways[3]}, or {ways[1]}.
              </>
            ) : (
              <>
                That's just{" "}
                <strong className="text-(--color-neutral900)">{ways[3]}</strong>{" "}
                on the Community Hub — or connect GitHub to earn points for your
                code contributions too.
              </>
            )}
          </p>
        </div>
      ) : (
        <p className="flex items-center gap-2 text-sm font-semibold text-(--color-neutral900)">
          <Trophy
            className="h-4 w-4 text-(--color-warning600)"
            aria-hidden="true"
          />
          You've reached the top tier — thank you for everything you do for the
          community!
        </p>
      )}
    </section>
  );
}

/** Every tier as a step: reached ones checked, the next one highlighted. */
function TierSteps({ dashboard }: { dashboard: ContributionsDashboard }) {
  const { tiers, score } = dashboard;
  const nextKey = tiers.find((tier) => score < tier.minScore)?.key;

  return (
    <ol className="grid grid-cols-4 gap-2">
      {tiers.map((tier) => {
        const reached = score >= tier.minScore;
        const isNext = tier.key === nextKey;
        const config = getContributorTierConfig(tier.key);

        return (
          <li
            key={tier.key}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-center",
              reached
                ? config?.className
                : isNext
                  ? "border-(--color-primary300) border-dashed bg-white text-(--color-neutral800)"
                  : "border-(--color-neutral150) bg-white text-(--color-neutral600) opacity-70",
            )}
          >
            <span className="flex items-center gap-1 text-xs font-semibold sm:text-sm">
              {reached && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
              {config?.shortLabel ?? tier.label}
            </span>
            <span className="text-[11px] tabular-nums opacity-80">
              {tier.minScore.toLocaleString("en-US")}+ pts
            </span>
          </li>
        );
      })}
    </ol>
  );
}

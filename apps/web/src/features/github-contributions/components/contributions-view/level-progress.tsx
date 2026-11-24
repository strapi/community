"use client";

import { Check, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getContributorTierConfig } from "../../lib/contributor-tiers";
import type { ContributionsDashboard } from "../../lib/dashboard";
import { getTierProgress, remainingAsContributions } from "../../lib/progress";
import { ContributorTierBadge } from "../contributor-tier-badge";

/**
 * How far along the tier track a score is, 0–100. The tiers sit evenly
 * spaced on the track (their thresholds aren't — 1, 20, 50, 100), and the
 * fill moves proportionally between the two tiers a score falls between.
 */
function trackPercent(
  score: number,
  tiers: ContributionsDashboard["tiers"],
): number {
  if (tiers.length < 2) return score >= (tiers[0]?.minScore ?? 0) ? 100 : 0;
  const step = 100 / (tiers.length - 1);

  for (let i = tiers.length - 1; i >= 0; i--) {
    const tier = tiers[i];
    if (!tier || score < tier.minScore) continue;
    const next = tiers[i + 1];
    if (!next) return 100;
    const within = (score - tier.minScore) / (next.minScore - tier.minScore);
    return i * step + within * step;
  }
  return 0;
}

/**
 * The header of every Community points page: the user's points and tier,
 * and the tier track — one line from Bronze to Platinum with their
 * progress along it — plus what reaching the next tier takes, in actual
 * contributions.
 */
export function LevelProgress({
  dashboard,
  gainPointsHref,
}: {
  dashboard: ContributionsDashboard;
  gainPointsHref: string;
}) {
  const { tiers, score } = dashboard;
  const { current, next, remaining } = getTierProgress(dashboard);
  const ways = remainingAsContributions(remaining, dashboard.points);
  const earning = dashboard.status === "active";
  const percent = trackPercent(score, tiers);

  // The one moment of motion: the track fills up once, after mount.
  const [shownPercent, setShownPercent] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShownPercent(percent));
    return () => cancelAnimationFrame(frame);
  }, [percent]);

  return (
    <section className="flex flex-col gap-8 rounded-lg border border-(--color-neutral150) bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <p className="flex flex-col">
          <span className="text-5xl font-semibold leading-none tracking-tight text-(--color-neutral900) tabular-nums">
            {score.toLocaleString("en-US")}
          </span>
          <span className="mt-2 text-sm text-(--color-neutral600)">
            community points
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {current && <ContributorTierBadge tier={current.key} />}
          {earning && next && (
            <Link
              href={gainPointsHref}
              className="inline-flex items-center gap-2 rounded-md bg-(--color-primary600) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--color-primary700) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary600)"
            >
              <Zap className="h-4 w-4" aria-hidden="true" />
              Gain points
            </Link>
          )}
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-valuetext={
          next
            ? `${score} points, ${remaining} to ${next.label}`
            : `${score} points, top tier reached`
        }
        aria-label="Progress through the contributor tiers"
      >
        {/* The track, inset by half a milestone so the end dots sit flush. */}
        <div className="relative mx-2 h-4">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-(--color-neutral150)" />
          <div
            className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-(--color-primary600) transition-[width] duration-1000 ease-out motion-reduce:transition-none"
            style={{ width: `${shownPercent}%` }}
          />
          {tiers.map((tier, index) => {
            const reached = score >= tier.minScore;
            const config = getContributorTierConfig(tier.key);
            return (
              <span
                key={tier.key}
                className={cn(
                  "absolute top-1/2 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ring-4 ring-white",
                  reached
                    ? (config?.accentClassName ?? "bg-(--color-primary600)")
                    : "border-2 border-(--color-neutral300) bg-white",
                  tier.key === next?.key &&
                    "border-(--color-primary600) border-dashed",
                )}
                style={{ left: `${(index / (tiers.length - 1)) * 100}%` }}
              >
                {reached && (
                  <Check
                    className="h-2.5 w-2.5 text-white"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                )}
              </span>
            );
          })}
        </div>

        {/* Labels sit under their milestones (same inset as the track);
            the outer two align to the card's edges instead of centring. */}
        <ol className="relative mx-2 mt-3 h-10 text-sm">
          {tiers.map((tier, index) => {
            const reached = score >= tier.minScore;
            const isNext = tier.key === next?.key;
            const config = getContributorTierConfig(tier.key);
            const first = index === 0;
            const last = index === tiers.length - 1;
            return (
              <li
                key={tier.key}
                className={cn(
                  "absolute top-0 flex flex-col whitespace-nowrap",
                  first
                    ? "-ml-2 items-start text-left"
                    : last
                      ? "-mr-2 items-end text-right"
                      : "-translate-x-1/2 items-center text-center",
                )}
                style={
                  last
                    ? { right: 0 }
                    : { left: `${(index / (tiers.length - 1)) * 100}%` }
                }
              >
                <span
                  className={cn(
                    "font-semibold",
                    reached || isNext
                      ? "text-(--color-neutral900)"
                      : "text-(--color-neutral600)",
                  )}
                >
                  {config?.shortLabel ?? tier.label}
                </span>
                <span className="text-xs text-(--color-neutral600) tabular-nums">
                  {tier.minScore.toLocaleString("en-US")}{" "}
                  {tier.minScore === 1 ? "pt" : "pts"}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="border-t border-(--color-neutral150) pt-5 text-sm text-(--color-neutral700)">
        {!earning ? (
          "Turn your GitHub contributions back on to earn points."
        ) : !next ? (
          "You've reached the top tier. Thank you for everything you do for the community."
        ) : (
          <>
            <strong className="font-semibold text-(--color-neutral900)">
              {remaining.toLocaleString("en-US")}{" "}
              {remaining === 1 ? "point" : "points"} to {next.label}.
            </strong>{" "}
            {dashboard.githubLinked
              ? `That's ${ways[0]}, ${ways[3]} or ${ways[1]}.`
              : `That's ${ways[3]} on the Community Hub — or connect GitHub to earn points for your code contributions too.`}
          </>
        )}
      </p>
    </section>
  );
}

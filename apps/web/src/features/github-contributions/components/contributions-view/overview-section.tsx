"use client";

import { EyeOff, Gift, Github, Lock, RefreshCw, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GITHUB_SCOPES } from "../../lib/config";
import type { ContributionsDashboard as Dashboard } from "../../lib/dashboard";
import { getTierProgress } from "../../lib/progress";
import { DashboardCard, linkClassName } from "./dashboard-card";
import { PointsBreakdown } from "./points-breakdown";

const relativeTime = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

/** e.g. "5 minutes ago", "yesterday". */
function timeAgo(iso: string): string {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return relativeTime.format(Math.round(seconds / size), unit);
    }
  }
  return "just now";
}

/**
 * The "Community points" section's index (below the level card): the
 * user's points with the "Refresh" button and where they come from, and
 * what the next tier unlocks — plus, without GitHub linked, a prompt to
 * connect it (only Community Hub submissions count until then).
 */
export function OverviewSection({
  dashboard,
  refreshing,
  onRefresh,
  gainPointsHref,
}: {
  dashboard: Dashboard;
  refreshing: boolean;
  onRefresh: () => void;
  gainPointsHref: string;
}) {
  if (dashboard.status === "hidden") {
    return (
      <Notice icon={EyeOff}>
        You've hidden your GitHub contributions, so you don't earn community
        points. Turn <strong>Show GitHub contributions</strong> back on in your{" "}
        <Link href="/account/profile" className={linkClassName}>
          Profile settings
        </Link>{" "}
        to start earning.
      </Notice>
    );
  }

  const canRefresh =
    !refreshing &&
    (!dashboard.refreshAvailableAt ||
      new Date(dashboard.refreshAvailableAt).getTime() <= Date.now());

  const where = GITHUB_SCOPES.map((scope) => scope.label).join(" and ");

  return (
    <div className="flex w-full flex-col gap-4 md:gap-6">
      {!dashboard.githubLinked && (
        <ConnectGithub since={formatSince(dashboard.since)} />
      )}

      <NextUnlock dashboard={dashboard} gainPointsHref={gainPointsHref} />

      <DashboardCard
        title="Where your points come from"
        description={`Your contributions to ${where} and the Community Hub since Strapi 5 (${formatSince(dashboard.since)}) that made a difference.`}
        action={
          <button
            type="button"
            onClick={onRefresh}
            disabled={!canRefresh}
            title={
              canRefresh
                ? "Check GitHub for new contributions"
                : "You can refresh once every 15 minutes"
            }
            className="inline-flex items-center gap-2 rounded-md border border-(--color-neutral150) bg-white px-3 py-1.5 text-sm font-semibold text-(--color-neutral800) transition-colors hover:bg-(--color-neutral100) disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={cn("h-4 w-4", refreshing && "animate-spin")}
              aria-hidden="true"
            />
            Refresh
          </button>
        }
      >
        <PointsBreakdown dashboard={dashboard} />
        <p className="-mt-2 text-xs text-(--color-neutral600)">
          {dashboard.stats?.syncedAt
            ? `Updated ${timeAgo(dashboard.stats.syncedAt)} · `
            : "Not checked yet — hit Refresh to count your contributions. "}
          Refreshed automatically every day.
        </p>
      </DashboardCard>
    </div>
  );
}

/**
 * The next tier's benefits, still locked — the "what's in it for me" next
 * to the level card's progress bar. At the top tier: what's unlocked.
 */
function NextUnlock({
  dashboard,
  gainPointsHref,
}: {
  dashboard: Dashboard;
  gainPointsHref: string;
}) {
  const { next, current, remaining } = getTierProgress(dashboard);
  const tier = next ?? current;
  if (!tier || tier.benefits.length === 0) return null;

  return (
    <DashboardCard
      title={next ? `Unlock at ${next.label}` : "Everything's unlocked"}
      description={
        next
          ? `${remaining.toLocaleString("en-US")} ${remaining === 1 ? "point" : "points"} to go — here's what's waiting for you.`
          : "You've earned every benefit there is. Thank you!"
      }
      action={
        next && (
          <Link
            href={gainPointsHref}
            className="inline-flex items-center gap-2 rounded-md bg-(--color-primary600) px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-(--color-primary700)"
          >
            <Zap className="h-4 w-4" aria-hidden="true" />
            Gain points
          </Link>
        )
      }
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {tier.benefits.map((benefit) => (
          <li
            key={benefit.title}
            className={cn(
              "flex items-start gap-3 rounded-md border p-4",
              next
                ? "border-dashed border-(--color-neutral300)"
                : "border-(--color-success200) bg-(--color-success100)",
            )}
          >
            {next ? (
              <Lock
                className="mt-0.5 h-4 w-4 shrink-0 text-(--color-neutral600)"
                aria-label="Locked"
              />
            ) : (
              <Gift
                className="mt-0.5 h-4 w-4 shrink-0 text-(--color-success700)"
                aria-hidden="true"
              />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-(--color-neutral900)">
                {benefit.title}
              </span>
              {benefit.description && (
                <span className="text-sm text-(--color-neutral600)">
                  {benefit.description}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}

function formatSince(since: string) {
  return new Date(since).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Shown instead of the tier progress while no GitHub account is linked —
 * without one there's nothing to count, so this is the way in.
 */
function ConnectGithub({ since }: { since: string }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-md border border-(--color-primary200) bg-(--color-primary100) p-5 sm:flex-row sm:items-center">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-(--color-neutral900)">
        <Github className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="flex grow flex-col gap-1">
        <p className="text-sm font-semibold text-(--color-neutral900)">
          You might already have points waiting
        </p>
        <p className="text-sm text-(--color-neutral700)">
          Most community points come from GitHub — merged pull requests, fixed
          issues and accepted answers — and everything since {since} counts.
          Connect your GitHub account to collect them.
        </p>
      </div>
      <Link
        href="/account/security"
        className="inline-flex shrink-0 items-center gap-2 rounded-md bg-(--color-primary600) px-4 py-2 text-sm font-semibold text-white"
      >
        <Github className="h-4 w-4" aria-hidden="true" />
        Connect GitHub
      </Link>
    </div>
  );
}

function Notice({
  icon: Icon,
  children,
}: {
  icon: typeof Github;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-(--color-primary200) bg-(--color-primary100) px-4 py-3 text-sm text-(--color-primary800)">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}

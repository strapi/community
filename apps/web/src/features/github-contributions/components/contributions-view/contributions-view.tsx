"use client";

import { useAuthenticate } from "@daveyplate/better-auth-ui";
import {
  ArrowUpRightIcon,
  AwardIcon,
  BookOpenIcon,
  GaugeIcon,
  type LucideIcon,
  MenuIcon,
  XIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/features/auth/lib/client";
import { cn } from "@/lib/utils";
import {
  CONTRIBUTOR_TIERS_HELP_URL,
  getContributorTierConfig,
} from "../../lib/contributor-tiers";
import {
  type ContributionsDashboard,
  getContributionsDashboard,
  refreshContributionsDashboard,
} from "../../lib/dashboard";
import { useContributionsEligibility } from "../../lib/use-contributions-eligibility";
import { DashboardCard, linkClassName } from "./dashboard-card";
import { GainPointsSection } from "./gain-points-section";
import { LevelProgress } from "./level-progress";
import { OverviewSection } from "./overview-section";
import { TierLadder } from "./tier-ladder";

type View = "OVERVIEW" | "GAIN" | "TIERS";

/**
 * URL segment per view (`/community-points/<segment>`); `OVERVIEW` is the
 * index. Mirrored by the route's titles (app/community-points/[[...path]]).
 */
export const contributionsViewPaths: Record<View, string> = {
  OVERVIEW: "",
  GAIN: "gain-points",
  TIERS: "tiers",
};

const NAV_ITEMS: { view: View; label: string; icon: LucideIcon }[] = [
  { view: "OVERVIEW", label: "Overview", icon: GaugeIcon },
  { view: "GAIN", label: "Gain points", icon: ZapIcon },
  { view: "TIERS", label: "Tiers & benefits", icon: AwardIcon },
];

const viewHref = (view: View) =>
  ["/community-points", contributionsViewPaths[view]].filter(Boolean).join("/");

const navItemClassName = (active: boolean) =>
  cn(
    "flex w-full items-center gap-2 rounded-md px-4 py-2 text-left text-sm font-medium transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
    active
      ? "bg-(--color-neutral100) font-semibold text-(--color-neutral900)"
      : "text-(--color-neutral700) hover:bg-(--color-neutral100)",
  );

/**
 * The signed-in user's own "Community points" section (`/community-points`,
 * linked from the user menu) — same sidebar + content layout as the
 * account settings and the partner portal, under a "level" card with
 * the user's progress to the next tier: where their points come from and
 * what's next to unlock, how to gain more points (with issues to fix),
 * and what each tier unlocks. Private; the public side is the profile's "GitHub
 * Contributions" tab. Not for Strapi employees (see
 * `useContributionsEligibility`).
 */
export function ContributionsView({ pathname }: { pathname: string }) {
  useAuthenticate();

  const { data: session } = authClient.useSession();
  const profileSlug = (session?.user as { slug?: string } | undefined)?.slug;
  const { eligible, isPending } = useContributionsEligibility();

  const [dashboard, setDashboard] = useState<ContributionsDashboard | null>(
    null,
  );
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Re-renders once a minute, so "updated … ago" and the refresh
  // cooldown stay current while the page is open.
  const [, setNow] = useState(0);

  const segment = pathname.split("/").filter(Boolean)[1] ?? "";
  const view =
    (Object.entries(contributionsViewPaths).find(
      ([, path]) => path === segment,
    )?.[0] as View | undefined) ?? "OVERVIEW";

  useEffect(() => {
    if (!eligible) return;
    let active = true;
    getContributionsDashboard()
      .then((data) => active && setDashboard(data))
      .catch(() => active && setFailed(true));
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [eligible]);

  // Close the mobile nav once navigating to a view actually lands on it.
  useEffect(() => {
    if (view) setMobileNavOpen(false);
  }, [view]);

  if (isPending || (eligible && !dashboard && !failed)) {
    return (
      <div className="flex w-full flex-col gap-4" aria-busy="true">
        <div className="h-12 w-64 animate-pulse rounded-md bg-(--color-neutral100)" />
        <div className="h-96 w-full animate-pulse rounded-md bg-(--color-neutral100)" />
      </div>
    );
  }

  if (!eligible) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-(--color-neutral150) px-6 py-16 text-center">
        <h1 className="text-lg font-semibold text-(--color-neutral900)">
          Community points aren't available for your account
        </h1>
        <Link
          href="/account"
          className="mt-2 text-sm font-semibold text-(--color-primary600) hover:underline"
        >
          Back to your account
        </Link>
      </div>
    );
  }

  const onRefresh = async () => {
    if (!dashboard) return;
    setRefreshing(true);
    try {
      const updated = await refreshContributionsDashboard();
      const gained = updated.score - dashboard.score;
      const newTier =
        updated.tier !== dashboard.tier &&
        getContributorTierConfig(updated.tier);
      setDashboard(updated);
      if (newTier && gained > 0) {
        toast.success(`🎉 Level up — you're now a ${newTier.label}!`, {
          description: `+${gained} points. Check out what you've unlocked under Tiers & benefits.`,
          duration: 8000,
        });
      } else {
        toast.success(
          gained > 0
            ? `+${gained} points — nice work!`
            : "You're all caught up — no new points yet.",
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't refresh right now.",
      );
    } finally {
      setRefreshing(false);
    }
  };

  const navLinks = (
    <>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.view}
          href={viewHref(item.view)}
          className={navItemClassName(view === item.view)}
        >
          <item.icon />
          <span className="grow">{item.label}</span>
        </Link>
      ))}
      <Link
        href={CONTRIBUTOR_TIERS_HELP_URL}
        className={navItemClassName(false)}
      >
        <BookOpenIcon />
        <span className="grow">How it works</span>
      </Link>
    </>
  );

  const currentItem = NAV_ITEMS.find((item) => item.view === view);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="text-xs font-semibold uppercase tracking-wider text-(--color-neutral600)">
            Community points
          </span>
          <span className="truncate text-base font-semibold text-(--color-neutral900)">
            {session?.user?.name}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {profileSlug && (
            <Link
              href={`/${profileSlug}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-(--color-neutral150) px-3 py-1.5 text-xs font-semibold text-(--color-neutral800) hover:bg-(--color-neutral100)"
            >
              View profile
              <ArrowUpRightIcon className="size-3.5" />
            </Link>
          )}
        </div>
      </div>

      {dashboard && (
        <LevelProgress
          dashboard={dashboard}
          gainPointsHref={viewHref("GAIN")}
        />
      )}

      <div className="flex w-full grow flex-col gap-4 md:flex-row md:gap-12">
        {/* Mobile: current view label + toggle for the nav list below it. */}
        <div className="flex items-center justify-between gap-2 md:hidden">
          <span className="font-semibold text-base">{currentItem?.label}</span>

          <button
            type="button"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((open) => !open)}
            className="rounded-md border border-(--color-neutral150) p-2 text-(--color-neutral700)"
          >
            {mobileNavOpen ? (
              <XIcon className="size-4" />
            ) : (
              <MenuIcon className="size-4" />
            )}
          </button>
        </div>

        {mobileNavOpen && (
          <nav className="flex flex-col gap-1 md:hidden">{navLinks}</nav>
        )}

        {/* Desktop: a persistent sidebar, like the settings pages. */}
        <nav className="hidden md:block">
          <div className="flex w-48 flex-col gap-1 lg:w-60">{navLinks}</div>
        </nav>

        <div className="flex w-full min-w-0 flex-col gap-4 md:gap-6">
          {!dashboard ? (
            <DashboardCard title="Community points">
              <p className="text-sm text-(--color-neutral600)">
                Couldn't load your contributions — please try again later.
              </p>
            </DashboardCard>
          ) : view === "TIERS" ? (
            <DashboardCard
              title="Tiers & benefits"
              description={
                <>
                  What you unlock as you contribute.{" "}
                  <Link
                    href={CONTRIBUTOR_TIERS_HELP_URL}
                    className={linkClassName}
                  >
                    How tiers work
                  </Link>
                </>
              }
            >
              <TierLadder dashboard={dashboard} />
            </DashboardCard>
          ) : view === "GAIN" ? (
            <GainPointsSection dashboard={dashboard} />
          ) : (
            <OverviewSection
              dashboard={dashboard}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          )}
        </div>
      </div>
    </div>
  );
}

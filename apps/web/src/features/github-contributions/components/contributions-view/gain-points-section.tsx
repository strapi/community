import {
  ArrowUpRight,
  CircleDot,
  GitPullRequest,
  type LucideIcon,
  MessageSquareCheck,
  Puzzle,
} from "lucide-react";
import Link from "next/link";
import type { ContributionsDashboard } from "../../lib/dashboard";
import { DashboardCard } from "./dashboard-card";
import { IssuesToPickUp } from "./issues-to-pick-up";

const GITHUB = "https://github.com";

/**
 * "Gain points": every way to earn community points (on GitHub and on the
 * Community Hub), each with where to start — and open strapi/strapi issues to fix right now, each showing
 * the points a merged fix earns.
 */
export function GainPointsSection({
  dashboard,
}: {
  dashboard: ContributionsDashboard;
}) {
  const { points } = dashboard;

  const ways: {
    icon: LucideIcon;
    points: number;
    title: string;
    description: string;
    action: { label: string; href: string };
    secondaryAction?: { label: string; href: string };
  }[] = [
    {
      icon: GitPullRequest,
      points: points.mergedPullRequest,
      title: "Get a pull request merged",
      description:
        "Fix a bug, improve the docs or build a feature in any strapi or strapi-community repository — the core, the docs, the design system, plugins and more.",
      action: { label: "Pick an issue below", href: "#issues" },
    },
    {
      icon: CircleDot,
      points: points.resolvedIssue,
      title: "Report a bug that gets fixed",
      description:
        "Found a bug? Report it with clear steps to reproduce — you earn points once a fix is merged.",
      action: {
        label: "Report a bug",
        href: `${GITHUB}/strapi/strapi/issues/new/choose`,
      },
    },
    {
      icon: MessageSquareCheck,
      points: points.acceptedAnswer,
      title: "Answer a question",
      description:
        "Help someone out in GitHub Discussions — you earn points when your answer is accepted.",
      action: {
        label: "Unanswered questions",
        href: `${GITHUB}/strapi/strapi/discussions?discussions_q=${encodeURIComponent("is:unanswered")}`,
      },
    },
    {
      icon: Puzzle,
      points: points.publishedPlugin,
      title: "Publish a plugin or template",
      description:
        "Share what you've built on the Community Hub — you earn points once it's approved and published. No GitHub account needed.",
      action: { label: "Submit a plugin", href: "/submit/plugin" },
      secondaryAction: { label: "Submit a template", href: "/submit/template" },
    },
  ];

  return (
    <div className="flex w-full flex-col gap-4 md:gap-6">
      <DashboardCard
        title="Ways to earn"
        description="Only contributions that made a difference count — so every point is one you can be proud of."
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {ways.map((way) => {
            const external = way.action.href.startsWith("http");
            return (
              <li
                key={way.title}
                className="flex flex-col gap-3 rounded-md border border-(--color-neutral150) p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-primary100) text-(--color-primary600)">
                    <way.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-(--color-success100) px-2.5 py-1 text-sm font-bold text-(--color-success700) tabular-nums">
                    +{way.points}
                  </span>
                </div>
                <div className="flex grow flex-col gap-1">
                  <span className="text-sm font-semibold text-(--color-neutral900)">
                    {way.title}
                  </span>
                  <span className="text-sm text-(--color-neutral600)">
                    {way.description}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <Link
                    href={way.action.href}
                    {...(external && {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-(--color-primary600) hover:underline"
                  >
                    {way.action.label}
                    {external && (
                      <ArrowUpRight
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                  {way.secondaryAction && (
                    <Link
                      href={way.secondaryAction.href}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-(--color-primary600) hover:underline"
                    >
                      {way.secondaryAction.label}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </DashboardCard>

      <DashboardCard
        id="issues"
        title={`Fix an issue, earn ${points.mergedPullRequest} points`}
        description="Open strapi/strapi issues nobody's working on yet. Comment that you're picking one up, open a pull request, and the points are yours once it's merged."
      >
        <IssuesToPickUp reward={points.mergedPullRequest} />
      </DashboardCard>
    </div>
  );
}

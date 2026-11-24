import {
  CircleDot,
  GitPullRequest,
  LayoutTemplate,
  MessageSquareCheck,
  Puzzle,
} from "lucide-react";
import type { ContributionsDashboard } from "../../lib/dashboard";

/** "Where your points come from": each counted contribution type × its points. */
export function PointsBreakdown({
  dashboard,
}: {
  dashboard: ContributionsDashboard;
}) {
  const { stats, points, score } = dashboard;

  const rows = [
    {
      icon: GitPullRequest,
      label: "Merged pull requests",
      count: stats?.mergedPullRequests ?? 0,
      each: points.mergedPullRequest,
    },
    {
      icon: CircleDot,
      label: "Fixed issues you reported",
      count: stats?.resolvedIssues ?? 0,
      each: points.resolvedIssue,
    },
    {
      icon: MessageSquareCheck,
      label: "Accepted discussion answers",
      count: stats?.acceptedAnswers ?? 0,
      each: points.acceptedAnswer,
    },
    {
      icon: Puzzle,
      label: "Published plugins",
      count: stats?.publishedPlugins ?? 0,
      each: points.publishedPlugin,
    },
    {
      icon: LayoutTemplate,
      label: "Published templates",
      count: stats?.publishedTemplates ?? 0,
      each: points.publishedTemplate,
    },
  ];

  return (
    <div className="flex flex-col">
      <ul className="divide-y divide-(--color-neutral150) rounded-md border border-(--color-neutral150)">
        {rows.map(({ icon: Icon, label, count, each }) => (
          <li key={label} className="flex items-center gap-3 px-4 py-3">
            <Icon
              className="h-4 w-4 shrink-0 text-(--color-primary600)"
              aria-hidden="true"
            />
            <span className="grow text-sm text-(--color-neutral800)">
              {label}
            </span>
            <span className="text-sm text-(--color-neutral600) tabular-nums">
              {count.toLocaleString("en-US")} × {each}
            </span>
            <span className="w-16 text-right text-sm font-semibold text-(--color-neutral900) tabular-nums">
              {(count * each).toLocaleString("en-US")}
            </span>
          </li>
        ))}
        <li className="flex items-center gap-3 bg-(--color-neutral100) px-4 py-3">
          <span className="grow text-sm font-semibold text-(--color-neutral900)">
            Total
          </span>
          <span className="w-16 text-right text-sm font-semibold text-(--color-neutral900) tabular-nums">
            {score.toLocaleString("en-US")}
          </span>
        </li>
      </ul>
    </div>
  );
}

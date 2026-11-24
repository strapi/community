import type { ContributionsDashboard, DashboardTier } from "./dashboard";

export type TierProgress = {
  current: DashboardTier | undefined;
  next: DashboardTier | undefined;
  /** Points needed for the next tier (0 at the top tier). */
  remaining: number;
  /** 0–100, from the current tier's threshold to the next one's. */
  percent: number;
};

/** Where the user stands between their current tier and the next one. */
export function getTierProgress(
  dashboard: ContributionsDashboard,
): TierProgress {
  const { tiers, score } = dashboard;
  const reached = tiers.filter((tier) => score >= tier.minScore);
  const current = reached.at(-1);
  const next = tiers.find((tier) => score < tier.minScore);

  if (!next) return { current, next, remaining: 0, percent: 100 };

  const floor = current?.minScore ?? 0;
  const percent = Math.max(
    0,
    Math.min(100, ((score - floor) / (next.minScore - floor)) * 100),
  );

  return { current, next, remaining: next.minScore - score, percent };
}

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

/**
 * The points still needed, as contributions — e.g. "1 merged pull
 * request", "3 fixed issues" — so the next tier reads as a concrete goal.
 * Without GitHub linked, only a published plugin counts.
 */
export function remainingAsContributions(
  remaining: number,
  points: ContributionsDashboard["points"],
) {
  if (remaining <= 0) return [];

  return [
    plural(
      Math.ceil(remaining / points.mergedPullRequest),
      "merged pull request",
      "merged pull requests",
    ),
    plural(
      Math.ceil(remaining / points.resolvedIssue),
      "fixed issue",
      "fixed issues",
    ),
    plural(
      Math.ceil(remaining / points.acceptedAnswer),
      "accepted answer",
      "accepted answers",
    ),
    plural(
      Math.ceil(remaining / points.publishedPlugin),
      "published plugin",
      "published plugins",
    ),
  ];
}

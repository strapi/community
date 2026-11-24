/**
 * Contributor tiers — a user's standing based on their contributions to
 * `strapi/strapi` and the `strapi-community` organization (see `github.ts`
 * and `GITHUB_SCOPES`).
 *
 * Every validated contribution earns points (`CONTRIBUTION_POINTS`); the total is the
 * user's `contribution_score`, and the highest tier whose `minScore` it
 * reaches is their `contributor_tier`. Both are stored on the user by the
 * daily `syncContributorTiers` job, so the members overview can filter and
 * sort on them.
 *
 * Mirrored for display in
 * apps/web/src/features/github-contributions/lib/contributor-tiers.ts, and
 * explained to users by the "Contributor tiers" help page
 * (seed/help-pages.ts, which builds its tables from these) — keep the web
 * mirror in sync.
 */

/**
 * Only contributions someone else has validated earn points, so opening a
 * pile of issues or discussions doesn't: a pull request counts once it's
 * merged, an issue once a merged pull request (or a maintainer's commit)
 * resolved it, and a discussion comment once it's marked as the accepted
 * answer.
 */
/**
 * Only contributions from the Strapi 5 era count — the `v5.0.0` release
 * (published 2024-09-18). Pull requests merged, issues closed and answers
 * accepted before then don't, so long-ago contributors don't permanently
 * outrank the people building Strapi today.
 */
export const CONTRIBUTIONS_SINCE = "2024-09-18";

export const CONTRIBUTION_POINTS = {
  mergedPullRequest: 10,
  resolvedIssue: 3,
  acceptedAnswer: 2,
} as const;

/** Ordered lowest to highest. Keys match the user's `contributor_tier` enum. */
export const CONTRIBUTOR_TIERS = [
  { key: "bronze", label: "Bronze Contributor", minScore: 1 },
  { key: "silver", label: "Silver Contributor", minScore: 20 },
  { key: "gold", label: "Gold Contributor", minScore: 50 },
  { key: "platinum", label: "Platinum Contributor", minScore: 100 },
] as const;

export type ContributorTier = (typeof CONTRIBUTOR_TIERS)[number]["key"];

export type ContributionCounts = {
  mergedPullRequests: number;
  resolvedIssues: number;
  acceptedAnswers: number;
};

export function computeContributionScore(counts: ContributionCounts): number {
  return (
    counts.mergedPullRequests * CONTRIBUTION_POINTS.mergedPullRequest +
    counts.resolvedIssues * CONTRIBUTION_POINTS.resolvedIssue +
    counts.acceptedAnswers * CONTRIBUTION_POINTS.acceptedAnswer
  );
}

/** The highest tier `score` reaches, or `null` below the first tier. */
export function getContributorTier(score: number): ContributorTier | null {
  let tier: ContributorTier | null = null;
  for (const { key, minScore } of CONTRIBUTOR_TIERS) {
    if (score >= minScore) tier = key;
  }
  return tier;
}

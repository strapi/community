/**
 * Contributor tiers — a user's standing based on their contributions to
 * the `strapi` and `strapi-community` organizations (see `github.ts`
 * and `GITHUB_SCOPES`), and the plugins and templates they've published
 * on the Community Hub (see `submissions.ts`).
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
 * answer. A plugin or template counts once it's approved and published
 * on the Community Hub.
 */
/**
 * Only contributions from the Strapi 5 era count — the `v5.0.0` release
 * (published 2024-09-18). Pull requests merged, issues closed and answers
 * accepted (and plugins or templates submitted) before then don't, so long-ago contributors don't permanently
 * outrank the people building Strapi today.
 */
export const CONTRIBUTIONS_SINCE = "2024-09-18";

export const CONTRIBUTION_POINTS = {
  mergedPullRequest: 10,
  resolvedIssue: 3,
  acceptedAnswer: 2,
  publishedPlugin: 10,
  publishedTemplate: 10,
} as const;

/** Ordered lowest to highest. Keys match the user's `contributor_tier` enum. */
export const CONTRIBUTOR_TIERS = [
  { key: "bronze", label: "Bronze Contributor", minScore: 1 },
  { key: "silver", label: "Silver Contributor", minScore: 20 },
  { key: "gold", label: "Gold Contributor", minScore: 50 },
  { key: "platinum", label: "Platinum Contributor", minScore: 100 },
] as const;

export type ContributorTier = (typeof CONTRIBUTOR_TIERS)[number]["key"];

/** Counted on GitHub (see `fetchGithubContributionCounts`). */
export type GithubContributionCounts = {
  mergedPullRequests: number;
  resolvedIssues: number;
  acceptedAnswers: number;
};

/** Counted on the Community Hub (see `countPublishedSubmissions`). */
export type HubContributionCounts = {
  publishedPlugins: number;
  publishedTemplates: number;
};

export type ContributionCounts = GithubContributionCounts &
  HubContributionCounts;

/** `ContributionCounts` as stored on the user (`contribution_stats`). */
export type ContributionStats = ContributionCounts & {
  /** When the counts were last checked (ISO 8601). */
  syncedAt: string;
};

export function computeContributionScore(counts: ContributionCounts): number {
  return (
    counts.mergedPullRequests * CONTRIBUTION_POINTS.mergedPullRequest +
    counts.resolvedIssues * CONTRIBUTION_POINTS.resolvedIssue +
    counts.acceptedAnswers * CONTRIBUTION_POINTS.acceptedAnswer +
    counts.publishedPlugins * CONTRIBUTION_POINTS.publishedPlugin +
    counts.publishedTemplates * CONTRIBUTION_POINTS.publishedTemplate
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

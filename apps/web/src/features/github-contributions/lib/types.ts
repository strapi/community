/**
 * Mirrors the CMS's `GithubContributions`
 * (apps/cms/src/extensions/better-auth/utils/github-contributions.ts),
 * returned by `GET /users/:id/github-contributions`.
 */
export type GithubContributionType = "issue" | "pull_request" | "discussion";

export type GithubContribution = {
  type: GithubContributionType;
  title: string;
  url: string;
  number: number;
  repository: string;
  state: "open" | "closed" | "merged" | "answered";
  createdAt: string;
};

export type GithubContributions = {
  login: string;
  totals: {
    issues: number;
    pullRequests: number;
    discussions: number;
  };
  /** The latest items across all types (up to 100 per type), newest first. */
  items: GithubContribution[];
};

export function hasGithubContributions(
  contributions: GithubContributions | null | undefined,
): contributions is GithubContributions {
  return Boolean(contributions && contributions.items.length > 0);
}

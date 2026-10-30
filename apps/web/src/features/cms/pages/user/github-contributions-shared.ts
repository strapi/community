import { CircleDot, GitPullRequest, MessagesSquare } from "lucide-react";

/**
 * Mirrors the CMS's `GithubContributions`
 * (apps/cms/src/extensions/better-auth/utils/github-contributions.ts),
 * returned by `GET /users/:id/github-contributions`. Shared by the
 * server-rendered section and the client-side feed.
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

export const GITHUB_REPO = "strapi/strapi";

export const CONTRIBUTION_TYPES = {
  issue: {
    label: "Issues",
    icon: CircleDot,
    qualifier: "is:issue",
    searchType: "issues",
    total: (totals: GithubContributions["totals"]) => totals.issues,
  },
  pull_request: {
    label: "Pull requests",
    icon: GitPullRequest,
    qualifier: "is:pr",
    searchType: "pullrequests",
    total: (totals: GithubContributions["totals"]) => totals.pullRequests,
  },
  discussion: {
    label: "Discussions",
    icon: MessagesSquare,
    qualifier: "",
    searchType: "discussions",
    total: (totals: GithubContributions["totals"]) => totals.discussions,
  },
} as const satisfies Record<GithubContributionType, unknown>;

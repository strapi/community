import { CircleDot, GitPullRequest, MessagesSquare } from "lucide-react";
import type { GithubContributions, GithubContributionType } from "./types";

/**
 * Where contributions are fetched from — mirrors the CMS's `GITHUB_SCOPES`
 * (apps/cms/src/plugins/contributions/server/src/constants.ts).
 */
export const GITHUB_SCOPES = [
  {
    qualifier: "org:strapi",
    label: "strapi",
    url: "https://github.com/strapi",
  },
  {
    qualifier: "org:strapi-community",
    label: "strapi-community",
    url: "https://github.com/strapi-community",
  },
] as const;

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

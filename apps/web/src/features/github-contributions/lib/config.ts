import { CircleDot, GitPullRequest, MessagesSquare } from "lucide-react";
import type { GithubContributions, GithubContributionType } from "./types";

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

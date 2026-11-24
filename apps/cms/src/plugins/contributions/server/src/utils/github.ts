/**
 * Fetches a GitHub user's issues, pull requests and discussions in
 * the `strapi` and `strapi-community` organizations
 * (`GITHUB_SEARCH_SCOPE`) — rendered as the "GitHub Contributions" tab on
 * a user's public profile page, and counted for their contributor tier.
 *
 * Uses the server-side `GITHUB_ACCESS_TOKEN` (the same one the
 * package-info plugin uses), not the user's own OAuth token: GitHub's
 * GraphQL API (the only API that can search discussions) requires *a*
 * token.
 *
 * One GraphQL request fetches the latest `MAX_ITEMS_PER_TYPE` of each type,
 * merged newest first. Anything older is still counted in `totals`, and
 * reachable through the profile's "View all on GitHub" links. Not cached
 * here — the web app caches the profile's request (see
 * apps/web/src/features/cms/pages/user/page.tsx).
 */

import { GITHUB_SEARCH_SCOPE } from "../constants";
import {
  CONTRIBUTIONS_SINCE,
  type GithubContributionCounts,
} from "./contributor-tiers";

/** GitHub's maximum page size for a single `search`. */
const MAX_ITEMS_PER_TYPE = 100;

export type GithubContributionType = "issue" | "pull_request" | "discussion";

export type GithubContributionState = "open" | "closed" | "merged" | "answered";

export type GithubContribution = {
  type: GithubContributionType;
  title: string;
  url: string;
  number: number;
  repository: string;
  state: GithubContributionState;
  createdAt: string;
};

export type GithubContributions = {
  login: string;
  totals: {
    issues: number;
    pullRequests: number;
    discussions: number;
  };
  /** The latest items across all types, newest first. */
  items: GithubContribution[];
};

type RepositoryNode = { nameWithOwner: string };

type IssueNode = {
  title: string;
  url: string;
  number: number;
  state: "OPEN" | "CLOSED" | "MERGED";
  createdAt: string;
  repository: RepositoryNode;
};

type DiscussionNode = {
  title: string;
  url: string;
  number: number;
  closed: boolean;
  isAnswered: boolean | null;
  createdAt: string;
  repository: RepositoryNode;
};

type SearchResponse = {
  data?: {
    issues: { issueCount: number; nodes: IssueNode[] };
    pullRequests: { issueCount: number; nodes: IssueNode[] };
    discussions: { discussionCount: number; nodes: DiscussionNode[] };
  };
  errors?: { message: string }[];
};

const SEARCH_QUERY = `
  query ($issues: String!, $pullRequests: String!, $discussions: String!, $first: Int!) {
    issues: search(query: $issues, type: ISSUE, first: $first) {
      issueCount
      nodes {
        ... on Issue {
          title url number state createdAt
          repository { nameWithOwner }
        }
      }
    }
    pullRequests: search(query: $pullRequests, type: ISSUE, first: $first) {
      issueCount
      nodes {
        ... on PullRequest {
          title url number state createdAt
          repository { nameWithOwner }
        }
      }
    }
    discussions: search(query: $discussions, type: DISCUSSION, first: $first) {
      discussionCount
      nodes {
        ... on Discussion {
          title url number closed isAnswered createdAt
          repository { nameWithOwner }
        }
      }
    }
  }
`;

function githubHeaders(token: string): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Resolves a GitHub login from the numeric user id better-auth stores as
 * the GitHub account's `accountId` — the login itself isn't stored, and
 * can change, while the id can't.
 */
async function fetchGithubLogin(
  githubUserId: string,
  token: string,
): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/user/${encodeURIComponent(githubUserId)}`,
    { headers: githubHeaders(token) },
  );
  // A deleted GitHub account — nothing to show, rather than an error.
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub user lookup failed: ${res.status}`);

  const body = (await res.json()) as { login?: string };
  return body.login ?? null;
}

function toIssueContribution(
  type: "issue" | "pull_request",
  node: IssueNode,
): GithubContribution {
  return {
    type,
    title: node.title,
    url: node.url,
    number: node.number,
    repository: node.repository.nameWithOwner,
    state: node.state.toLowerCase() as GithubContributionState,
    createdAt: node.createdAt,
  };
}

function toDiscussionContribution(node: DiscussionNode): GithubContribution {
  return {
    type: "discussion",
    title: node.title,
    url: node.url,
    number: node.number,
    repository: node.repository.nameWithOwner,
    state: node.isAnswered ? "answered" : node.closed ? "closed" : "open",
    createdAt: node.createdAt,
  };
}

// `search` nodes are typed as a union, so a fragment that doesn't apply
// comes back as `{}` — drop those.
const hasRepository = (node: { repository?: RepositoryNode }) =>
  Boolean(node.repository);

async function searchContributions(
  login: string,
  token: string,
): Promise<GithubContributions | null> {
  const base = `author:${login} ${GITHUB_SEARCH_SCOPE}`;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      ...githubHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: SEARCH_QUERY,
      variables: {
        issues: `${base} is:issue sort:created-desc`,
        pullRequests: `${base} is:pr sort:created-desc`,
        // Discussion search ignores `sort:created-*`, but does honor
        // `sort:updated-*` — the most recently active ones, which are
        // re-sorted by `createdAt` below anyway.
        discussions: `${base} sort:updated-desc`,
        first: MAX_ITEMS_PER_TYPE,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(
      `GitHub contributions search failed for "${login}": ${res.status}`,
    );
  }

  const { data, errors } = (await res.json()) as SearchResponse;
  if (!data) {
    throw new Error(
      `GitHub contributions search failed for "${login}": ${errors?.map((e) => e.message).join("; ")}`,
    );
  }

  const items = [
    ...data.issues.nodes
      .filter(hasRepository)
      .map((node) => toIssueContribution("issue", node)),
    ...data.pullRequests.nodes
      .filter(hasRepository)
      .map((node) => toIssueContribution("pull_request", node)),
    ...data.discussions.nodes
      .filter(hasRepository)
      .map(toDiscussionContribution),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    login,
    totals: {
      issues: data.issues.issueCount,
      pullRequests: data.pullRequests.issueCount,
      discussions: data.discussions.discussionCount,
    },
    items,
  };
}

/**
 * Returns the contributions for the GitHub account with the given numeric
 * id, or `null` if there's nothing to show (no token configured, deleted
 * GitHub account). Throws if GitHub can't be reached or errors, so callers
 * can tell a temporary failure apart from "nothing to show".
 */
export async function fetchGithubContributions(
  githubUserId: string,
): Promise<GithubContributions | null> {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) {
    strapi.log.warn(
      "GITHUB_ACCESS_TOKEN is not set — GitHub contributions are disabled.",
    );
    return null;
  }

  const login = await fetchGithubLogin(githubUserId, token);
  if (!login) return null;

  return searchContributions(login, token);
}

/** One page of a GitHub GraphQL `search`. */
type SearchPage<Node> = {
  issueCount?: number;
  discussionCount?: number;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: Node[];
};

/**
 * Runs a GraphQL `search` and returns every node, following the cursor
 * (GitHub caps a search at 1,000 results). `nodeFields` selects the
 * fields of each node.
 */
async function searchAll<Node>({
  token,
  query,
  type,
  nodeFields,
}: {
  token: string;
  query: string;
  type: "ISSUE" | "DISCUSSION";
  nodeFields: string;
}): Promise<Node[]> {
  const nodes: Node[] = [];
  let after: string | null = null;

  do {
    const page = await searchPage<Node>({
      token,
      query,
      type,
      first: MAX_ITEMS_PER_TYPE,
      after,
      nodeFields,
    });
    nodes.push(...page.nodes);
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);

  return nodes;
}

/** The total number of results of an issue/PR `search`, in one request. */
async function searchCount(token: string, query: string): Promise<number> {
  const page = await searchPage({
    token,
    query,
    type: "ISSUE",
    first: 1,
    after: null,
    nodeFields: "__typename",
  });
  return page.issueCount ?? 0;
}

async function searchPage<Node>({
  token,
  query,
  type,
  first,
  after,
  nodeFields,
}: {
  token: string;
  query: string;
  type: "ISSUE" | "DISCUSSION";
  first: number;
  after: string | null;
  nodeFields: string;
}): Promise<SearchPage<Node>> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...githubHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
          query ($query: String!, $after: String) {
            search(query: $query, type: ${type}, first: ${first}, after: $after) {
              issueCount
              discussionCount
              pageInfo { hasNextPage endCursor }
              nodes { ${nodeFields} }
            }
          }
        `,
      variables: { query, after },
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub search "${query}" failed: ${res.status}`);
  }

  const { data, errors } = (await res.json()) as {
    data?: { search: SearchPage<Node> };
    errors?: { message: string }[];
  };
  if (!data) {
    throw new Error(
      `GitHub search "${query}" failed: ${errors?.map((e) => e.message).join("; ")}`,
    );
  }

  return data.search;
}

type ClosedIssueNode = {
  closedByPullRequestsReferences?: { nodes: { merged: boolean }[] };
  timelineItems?: {
    nodes: {
      closer?: { __typename: string; merged?: boolean } | null;
    }[];
  };
};

/**
 * Resolved by a merged pull request (one that references the issue with a
 * closing keyword, or the one that closed it) or by a commit — both
 * require someone with write access, so the author can't do it alone.
 */
function isResolvedIssue(node: ClosedIssueNode): boolean {
  if (node.closedByPullRequestsReferences?.nodes.some((pr) => pr.merged)) {
    return true;
  }
  const closer = node.timelineItems?.nodes[0]?.closer;
  return (
    closer?.__typename === "Commit" ||
    (closer?.__typename === "PullRequest" && closer.merged === true)
  );
}

type AnsweredDiscussionNode = {
  answerChosenAt?: string | null;
  answer?: { author?: { login: string } | null } | null;
};

/**
 * The validated contribution counts contributor tiers are based on (see
 * `contributor-tiers.ts`), for the daily `syncContributorTiers` job — all
 * since `CONTRIBUTIONS_SINCE`:
 *
 * - pull requests merged since then — just the total;
 * - the user's issues closed since then, checked one by one for a merged
 *   PR or commit that resolved them;
 * - answered discussions the user commented in, checked for whether the
 *   accepted answer is theirs and was accepted since then (search can't
 *   filter on either; `updated:` narrows it, as accepting an answer
 *   updates the discussion).
 *
 * `null` when there's nothing to count (no token configured, deleted
 * GitHub account). Throws if GitHub can't be reached or errors.
 */
export async function fetchGithubContributionCounts(
  githubUserId: string,
): Promise<GithubContributionCounts | null> {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) return null;

  const login = await fetchGithubLogin(githubUserId, token);
  if (!login) return null;

  const [mergedPullRequests, closedIssues, answeredDiscussions] =
    await Promise.all([
      searchCount(
        token,
        `author:${login} ${GITHUB_SEARCH_SCOPE} is:pr is:merged merged:>=${CONTRIBUTIONS_SINCE}`,
      ),
      searchAll<ClosedIssueNode>({
        token,
        query: `author:${login} ${GITHUB_SEARCH_SCOPE} is:issue is:closed closed:>=${CONTRIBUTIONS_SINCE}`,
        type: "ISSUE",
        nodeFields: `
          ... on Issue {
            closedByPullRequestsReferences(first: 10, includeClosedPrs: true) {
              nodes { merged }
            }
            timelineItems(itemTypes: [CLOSED_EVENT], last: 1) {
              nodes {
                ... on ClosedEvent {
                  closer {
                    __typename
                    ... on PullRequest { merged }
                  }
                }
              }
            }
          }
        `,
      }),
      searchAll<AnsweredDiscussionNode>({
        token,
        query: `commenter:${login} ${GITHUB_SEARCH_SCOPE} is:answered updated:>=${CONTRIBUTIONS_SINCE}`,
        type: "DISCUSSION",
        nodeFields:
          "... on Discussion { answerChosenAt answer { author { login } } }",
      }),
    ]);

  return {
    mergedPullRequests,
    resolvedIssues: closedIssues.filter(isResolvedIssue).length,
    acceptedAnswers: answeredDiscussions.filter(
      (node) =>
        node.answer?.author?.login.toLowerCase() === login.toLowerCase() &&
        (node.answerChosenAt ?? "") >= CONTRIBUTIONS_SINCE,
    ).length,
  };
}

export type OpenIssue = {
  title: string;
  url: string;
  number: number;
  repository: string;
  labels: string[];
  comments: number;
  updatedAt: string;
};

type OpenIssueNode = {
  title?: string;
  url: string;
  number: number;
  updatedAt: string;
  repository?: RepositoryNode;
  labels: { nodes: { name: string }[] };
  comments: { totalCount: number };
};

/**
 * Up to `limit` issues matching an issue `search` query (which carries its
 * own scope, state and sort qualifiers) — for the contributions
 * dashboard's "issues to pick up". `[]` when no token is configured.
 */
export async function fetchOpenIssues(
  query: string,
  limit: number,
): Promise<OpenIssue[]> {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) return [];

  const page = await searchPage<OpenIssueNode>({
    token,
    query,
    type: "ISSUE",
    first: limit,
    after: null,
    nodeFields: `
      ... on Issue {
        title url number updatedAt
        repository { nameWithOwner }
        labels(first: 10) { nodes { name } }
        comments { totalCount }
      }
    `,
  });

  return page.nodes.filter(hasRepository).map((node) => ({
    title: node.title ?? "",
    url: node.url,
    number: node.number,
    repository: node.repository?.nameWithOwner ?? "",
    labels: node.labels.nodes.map((label) => label.name),
    comments: node.comments.totalCount,
    updatedAt: node.updatedAt,
  }));
}

/**
 * Fetches a GitHub user's issues, pull requests and discussions in the
 * `GITHUB_REPOS` repositories — rendered as the "GitHub Contributions" tab
 * on a user's public profile page.
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

const GITHUB_REPOS = ["strapi/strapi"];

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
  const repos = GITHUB_REPOS.map((repo) => `repo:${repo}`).join(" ");
  const base = `author:${login} ${repos}`;

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

/**
 * Client for the personal contributions dashboard — the CMS contributions
 * plugin's `/api/contributions/me*` routes (authenticated by the
 * better-auth session cookie) and its public `/api/contributions/issues`.
 * Mirrors apps/cms/src/plugins/contributions/server/src/services/dashboard.ts.
 */

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;

/**
 * `hidden`: the user hid their GitHub contributions, and earns no points.
 * Strapi employees have no dashboard — see `getContributionsEligibility`.
 */
export type DashboardStatus = "active" | "hidden";

export type ContributionStats = {
  mergedPullRequests: number;
  resolvedIssues: number;
  acceptedAnswers: number;
  /** In strapi-community repositories, which earn fewer points. */
  communityMergedPullRequests?: number;
  communityResolvedIssues?: number;
  communityAcceptedAnswers?: number;
  publishedPlugins: number;
  publishedTemplates: number;
  syncedAt: string;
};

export type DashboardTier = {
  key: string;
  label: string;
  minScore: number;
  benefits: { title: string; description: string | null }[];
};

export type ContributionsDashboard = {
  status: DashboardStatus;
  /** Without GitHub, only Community Hub submissions earn points. */
  githubLinked: boolean;
  /** Tier roles on Discord: whether they're set up, and connected. */
  discord: { enabled: boolean; linked: boolean };
  tier: string | null;
  score: number;
  stats: ContributionStats | null;
  /** When the "Refresh" button may be used again; `null` = now. */
  refreshAvailableAt: string | null;
  points: {
    mergedPullRequest: number;
    resolvedIssue: number;
    acceptedAnswer: number;
    communityMergedPullRequest: number;
    communityResolvedIssue: number;
    communityAcceptedAnswer: number;
    publishedPlugin: number;
    publishedTemplate: number;
  };
  /** Only contributions since this date count (YYYY-MM-DD). */
  since: string;
  /** Lowest to highest. */
  tiers: DashboardTier[];
};

export type IssueToPickUp = {
  kind: "good-first-issue" | "confirmed-bug";
  title: string;
  url: string;
  number: number;
  repository: string;
  labels: string[];
  comments: number;
  updatedAt: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${CMS_URL}/api/contributions${path}`, {
    credentials: "include",
    ...init,
  });
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      body?.error?.message ??
        (typeof body?.error === "string"
          ? body.error
          : "Something went wrong."),
    );
  }

  return body.data as T;
}

/**
 * Whether the signed-in user has a contributions dashboard — everyone but
 * current and former Strapi employees.
 */
export const getContributionsEligibility = () =>
  request<{ eligible: boolean }>("/me/eligibility");

export const getContributionsDashboard = () =>
  request<ContributionsDashboard>("/me");

export const refreshContributionsDashboard = () =>
  request<ContributionsDashboard>("/me/refresh", { method: "POST" });

export const getIssuesToPickUp = () => request<IssueToPickUp[]>("/issues");

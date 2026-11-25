/**
 * Where contributions count: every repository of the `strapi` organization
 * (the core `strapi/strapi`, the docs, the design system, the SDKs, …) and
 * of the `strapi-community` organization (community plugins,
 * providers and tools — including repositories added later). Combined in a
 * single GitHub search, which treats scope qualifiers as "any of".
 *
 * Mirrored for display in apps/web/src/features/github-contributions/lib/config.ts.
 */
export const STRAPI_SCOPE = {
  organization: "strapi",
  qualifier: "org:strapi",
  label: "strapi",
  url: "https://github.com/strapi",
} as const;

/** Earns fewer points than `strapi` — see `CONTRIBUTION_POINTS`. */
export const COMMUNITY_SCOPE = {
  organization: "strapi-community",
  qualifier: "org:strapi-community",
  label: "strapi-community",
  url: "https://github.com/strapi-community",
} as const;

export const GITHUB_SCOPES = [STRAPI_SCOPE, COMMUNITY_SCOPE] as const;

/**
 * The scope part of every GitHub search query. Public repositories only:
 * the server's token may be able to see private ones, and neither the
 * profile nor community points may reveal or reward work in them.
 */
export const GITHUB_SEARCH_SCOPE = `${GITHUB_SCOPES.map(({ qualifier }) => qualifier).join(" ")} is:public`;

/**
 * Public repositories of the scope organizations whose contributions don't
 * earn community points — Strapi's own projects rather than open-source
 * work: the strapi.io website, and the community program's own repository.
 * They still show on the profile's GitHub Contributions tab.
 */
export const EXCLUDED_FROM_POINTS = ["strapi/website", "strapi/community"];

const pointsExclusions = EXCLUDED_FROM_POINTS.map(
  (repository) => `-repo:${repository}`,
).join(" ");

/**
 * The scope of the searches that count contributions for community points
 * — `scopes` (default: both organizations), public repositories only,
 * without `EXCLUDED_FROM_POINTS`.
 */
export const pointsSearchScope = (
  scopes: readonly { qualifier: string }[] = GITHUB_SCOPES,
) =>
  `${scopes.map(({ qualifier }) => qualifier).join(" ")} is:public ${pointsExclusions}`;

/**
 * Open, unassigned issues in strapi/strapi (only — not strapi-community)
 * without a linked pull request, suggested on the personal contributions
 * dashboard — searched in order until there are
 * enough. "good first issue" comes first, though strapi/strapi hasn't used
 * that label in a while; confirmed low-severity bugs are the next best
 * signal for approachable, already-triaged work.
 */
export const ISSUES_TO_PICK_UP = [
  {
    kind: "good-first-issue",
    query:
      'repo:strapi/strapi is:issue is:open label:"good first issue" no:assignee -linked:pr sort:updated-desc',
  },
  {
    kind: "confirmed-bug",
    query:
      'repo:strapi/strapi is:issue is:open label:"status: confirmed" label:"severity: low" no:assignee -linked:pr sort:updated-desc',
  },
] as const;

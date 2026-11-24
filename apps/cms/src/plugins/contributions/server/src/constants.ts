/**
 * Where contributions count: every repository of the `strapi` organization
 * (the core `strapi/strapi`, the docs, the design system, the SDKs, …) and
 * of the `strapi-community` organization (community plugins,
 * providers and tools — including repositories added later). Combined in a
 * single GitHub search, which treats scope qualifiers as "any of".
 *
 * Mirrored for display in apps/web/src/features/github-contributions/lib/config.ts.
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

/** The scope part of every GitHub search query. */
export const GITHUB_SEARCH_SCOPE = GITHUB_SCOPES.map(
  ({ qualifier }) => qualifier,
).join(" ");

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

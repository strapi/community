/**
 * Where contributions count: the core `strapi/strapi` repository, and every
 * repository of the `strapi-community` organization (community plugins,
 * providers and tools — including repositories added later). Combined in a
 * single GitHub search, which treats scope qualifiers as "any of".
 *
 * Mirrored for display in apps/web/src/features/github-contributions/lib/config.ts.
 */
export const GITHUB_SCOPES = [
  {
    qualifier: "repo:strapi/strapi",
    label: "strapi/strapi",
    url: "https://github.com/strapi/strapi",
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

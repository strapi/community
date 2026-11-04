/**
 * Default index (including its sort replica) and refinement facets per search
 * UI. Shared by the client widgets and the server-side first-page fetch, so
 * the server-rendered results match what the widgets ask for.
 */
export type SearchIndexConfig = {
  indexName: string;
  facets: string[];
};

const env = (name: string | undefined) => name ?? "";

export const SEARCH_INDEXES = {
  packages: {
    indexName: `${env(process.env.NEXT_PUBLIC_MEILISEARCH_PACKAGES_INDEX_NAME)}:monthly_downloads:desc`,
    facets: ["type", "categories.name", "integrations.name"],
  },
  templates: {
    indexName: `${env(process.env.NEXT_PUBLIC_MEILISEARCH_TEMPLATES_INDEX_NAME)}:stars:desc`,
    facets: ["categories.name", "integrations.name"],
  },
  members: {
    indexName: `${env(process.env.NEXT_PUBLIC_MEILISEARCH_MEMBERS_INDEX_NAME)}:createdAt:desc`,
    facets: ["community_star"],
  },
  partners: {
    indexName: `${env(process.env.NEXT_PUBLIC_MEILISEARCH_PARTNERS_INDEX_NAME)}:partner_level_rank:asc`,
    facets: [
      "partner_level",
      "profile.services.name",
      "profile.countries.name",
    ],
  },
  integrations: {
    indexName: `${env(process.env.NEXT_PUBLIC_MEILISEARCH_INTEGRATIONS_INDEX_NAME)}:labels.featured:desc`,
    facets: ["categories.name"],
  },
  showcases: {
    indexName: `${env(process.env.NEXT_PUBLIC_MEILISEARCH_SHOWCASES_INDEX_NAME)}:createdAt:desc`,
    facets: ["categories.name"],
  },
  helpPages: {
    indexName: `${env(process.env.NEXT_PUBLIC_MEILISEARCH_HELP_PAGES_INDEX_NAME)}:createdAt:desc`,
    facets: [],
  },
  recipes: {
    indexName: `${env(process.env.NEXT_PUBLIC_MEILISEARCH_RECIPES_INDEX_NAME)}:createdAt:desc`,
    facets: [],
  },
} satisfies Record<string, SearchIndexConfig>;

export const HITS_PER_PAGE = 24;

export const categoryFilter = (category?: string) =>
  category ? `categories.name = "${category}"` : undefined;

export default ({ env }) => ({
  "owner-selector": {
    enabled: true,
    resolve: "./src/plugins/owner-selector",
  },
  "package-info": {
    enabled: true,
    resolve: "./src/plugins/package-info",
  },
  webtools: {
    enabled: true,
    config: {
      website_url: env("WEBSITE_URL"),
    },
  },
  meilisearch: {
    enabled: env("ENABLE_MIGRATION") !== "true",
    config: {
      host: env("MEILISEARCH_HOST"),
      apiKey: env("MEILISEARCH_API_KEY"),
      package: {
        indexName: env("MEILISEARCH_PACKAGES_INDEX_NAME"),
        entriesQuery: {
          populate: [
            "owner",
            "maintainers.profile.avatar",
            "icon",
            "labels",
            "url_alias",
            "categories",
            "integrations",
          ],
        },
        settings: {
          sortableAttributes: ["monthly_downloads", "stars", "createdAt"],
          searchableAttributes: ["name", "description"],
          filterableAttributes: [
            "type",
            "categories",
            "labels.featured",
            "labels.official",
            "labels.paid",
            "integrations",
          ],
        },
      },
      template: {
        indexName: env("MEILISEARCH_TEMPLATES_INDEX_NAME"),
        entriesQuery: {
          populate: [
            "maintainers.profile.avatar",
            "preview_image",
            "labels",
            "url_alias",
            "categories",
          ],
        },
        settings: {
          sortableAttributes: ["monthly_downloads", "stars", "createdAt"],
          filterableAttributes: [
            "type",
            "categories",
            "labels.featured",
            "labels.official",
            "labels.paid",
          ],
        },
      },
      showcase: {
        indexName: env("MEILISEARCH_SHOWCASES_INDEX_NAME"),
        entriesQuery: {
          populate: ["image", "categories"],
        },
        settings: {
          sortableAttributes: ["createdAt"],
          filterableAttributes: ["categories"],
        },
      },
      recipe: {
        indexName: env("MEILISEARCH_RECIPES_INDEX_NAME"),
        entriesQuery: {
          populate: ["image", "url_alias"],
        },
        settings: {
          sortableAttributes: ["createdAt"],
          filterableAttributes: [],
        },
      },
      integration: {
        indexName: env("MEILISEARCH_INTEGRATIONS_INDEX_NAME"),
        entriesQuery: {
          populate: ["logo", "categories", "url_alias"],
        },
        settings: {
          sortableAttributes: ["createdAt"],
          filterableAttributes: ["categories"],
        },
      },
      user: {
        indexName: env("MEILISEARCH_MEMBERS_INDEX_NAME"),
        entriesQuery: {
          populate: ["profile.avatar", "url_alias"],
        },
        settings: {
          sortableAttributes: ["createdAt"],
          filterableAttributes: ["profile.services.name"],
        },
      },
      organization: {
        indexName: env("MEILISEARCH_PARTNERS_INDEX_NAME"),
        entriesQuery: {
          populate: [
            "profile.avatar",
            "profile.services",
            "profile.countries",
            "url_alias",
          ],
        },
        filterEntry: ({ entry }) => entry.partner,
        transformEntry: ({ entry }) => {
          const rankMap = { Enterprise: 1, Business: 2, Community: 3 };
          const levelRank = rankMap[entry.partner_level] ?? 4;
          const BASE = 10_000_000_000_000;
          const createdAtMs = entry.createdAt
            ? new Date(entry.createdAt).getTime()
            : 0;
          return {
            ...entry,
            partner_level_rank: levelRank * BASE + createdAtMs,
          };
        },
        settings: {
          sortableAttributes: ["createdAt", "partner_level_rank"],
          filterableAttributes: [
            "partner_level",
            "profile.countries.name",
            "profile.services.name",
          ],
        },
      },
    },
  },
});

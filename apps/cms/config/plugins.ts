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
    config: {
      host: env("MEILISEARCH_HOST"),
      apiKey: env("MEILISEARCH_API_KEY"),
      package: {
        indexName: env("MEILISEARCH_PACKAGES_INDEX_NAME"),
        entriesQuery: {
          populate: [
            "maintainers.profile.avatar",
            "icon",
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
          populate: ["image", "categories"],
        },
        settings: {
          sortableAttributes: ["createdAt"],
          filterableAttributes: ["categories"],
        },
      },
      integration: {
        indexName: env("MEILISEARCH_INTEGRATIONS_INDEX_NAME"),
        entriesQuery: {
          populate: ["logo", "categories"],
        },
        settings: {
          sortableAttributes: ["createdAt"],
          filterableAttributes: ["categories"],
        },
      },
      user: {
        indexName: env("MEILISEARCH_USER_INDEX_NAME"),
        entriesQuery: {
          populate: ["profile.avatar"],
        },
        settings: {
          // @todo - implement partner filters
          // filterableAttributes: [
          //   "categories",
          // ],
        },
      },
      organization: {
        indexName: env("MEILISEARCH_MEMBERS_INDEX_NAME"),
        entriesQuery: {
          populate: ["profile.avatar"],
        },
        settings: {
          // @todo - implement partner filters
          // filterableAttributes: [
          //   "categories",
          // ],
        },
      },
    },
  },
});

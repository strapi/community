export default ({ env }) => ({
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
        indexName: env("MEILISEARCH_GENERIC_INDEX_NAME"),
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
          sortableAttributes: ["npm_downloads", "github_stars", "createdAt"],
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
        indexName: env("MEILISEARCH_GENERIC_INDEX_NAME"),
        entriesQuery: {
          populate: [
            "maintainers.profile.avatar",
            "labels",
            "url_alias",
            "categories",
          ],
        },
        settings: {
          sortableAttributes: ["npm_downloads", "github_stars", "createdAt"],
          filterableAttributes: [
            "type",
            "categories",
            "labels.featured",
            "labels.official",
            "labels.paid",
          ],
        },
      },
    },
  },
});

import { twoFactor } from 'better-auth/plugins'

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
        indexName: "search_page",
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
    },
  },
  'better-auth': {
    enabled: true,
    config: {
      debug: true,
      betterAuthOptions: {
        trustedOrigins: [env("WEBSITE_URL")],
        emailAndPassword: {
          enabled: true,
        },
        plugins: [twoFactor()]
      }
    }
  }
});

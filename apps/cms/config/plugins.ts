// n8n webhook path namespace. Each Strapi instance posts to "<namespace>/<event>",
// so duplicate workflow sets sharing one n8n instance (e.g. staging vs production)
// listen on distinct paths and never collide. Defaults to "strapi" (production).
const N8N_WEBHOOK_NS = process.env.N8N_WEBHOOK_NAMESPACE || "strapi";

export default ({ env }) => ({
  email: {
    config: {
      provider: "@piksail/strapi-provider-email-mailpit",
      providerOptions: {
        baseUrl: env("MAILPIT_BASE_URL", "http://localhost:8025"),
      },
      settings: {
        defaultFrom: env("EMAIL_DEFAULT_FROM", "community@strapi.io"),
        defaultReplyTo: env("EMAIL_DEFAULT_REPLY_TO", "community@strapi.io"),
      },
    },
  },
  "owner-selector": {
    enabled: true,
    resolve: "./src/plugins/owner-selector",
  },
  moderation: {
    enabled: true,
    resolve: "./src/plugins/moderation",
    config: {
      contentTypes: [
        {
          uid: "api::package.package",
          singularName: "package",
          pluralName: "packages",
          label: "Plugins",
          categoryUid: "api::package-category.package-category",
          defaultFieldValues: {
            labels: { official: false, featured: false, paid: false },
          },
          checks: [
            "repo_public",
            "readme_exists",
            "mit_license",
            "strapi_peer_dep",
            "enterprise_competition",
          ],
          webhooks: {
            submissionReceived: `${N8N_WEBHOOK_NS}/plugin-submission-received`,
            approved: `${N8N_WEBHOOK_NS}/plugin-approved`,
            declined: `${N8N_WEBHOOK_NS}/plugin-declined`,
            changesRequested: `${N8N_WEBHOOK_NS}/plugin-changes-requested`,
          },
        },
        {
          uid: "api::template.template",
          singularName: "template",
          pluralName: "templates",
          label: "Templates",
          categoryUid: "api::template-category.template-category",
          defaultFieldValues: {
            labels: { official: false, featured: false, paid: false },
          },
          checks: ["repo_public", "readme_exists", "mit_license"],
          webhooks: {
            submissionReceived: `${N8N_WEBHOOK_NS}/template-submission-received`,
            approved: `${N8N_WEBHOOK_NS}/template-approved`,
            declined: `${N8N_WEBHOOK_NS}/template-declined`,
          },
        },
      ],
    },
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
            "maintainers",
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
            "owner",
            "maintainers",
            "preview_image",
            "labels",
            "url_alias",
            "integrations",
            "categories",
          ],
        },
        settings: {
          sortableAttributes: ["monthly_downloads", "stars", "createdAt"],
          filterableAttributes: [
            "type",
            "categories",
            "integrations",
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
      "help-page": {
        indexName: env("MEILISEARCH_HELP_PAGES_INDEX_NAME"),
        entriesQuery: {
          populate: ["image", "url_alias", "parent"],
        },
        filterEntry: ({ entry }) => !entry.parent,
        settings: {
          sortableAttributes: ["createdAt"],
          searchableAttributes: ["title", "description"],
          filterableAttributes: [],
        },
      },
      integration: {
        indexName: env("MEILISEARCH_INTEGRATIONS_INDEX_NAME"),
        entriesQuery: {
          populate: ["logo", "labels", "categories", "url_alias"],
        },
        settings: {
          sortableAttributes: ["labels.featured"],
          filterableAttributes: ["categories"],
        },
      },
      user: {
        indexName: env("MEILISEARCH_MEMBERS_INDEX_NAME"),
        entriesQuery: {
          populate: ["profile", "profile.services", "url_alias"],
        },
        settings: {
          sortableAttributes: ["createdAt", "community_star"],
          filterableAttributes: ["profile.services.name", "community_star"],
        },
      },
      organization: {
        indexName: env("MEILISEARCH_PARTNERS_INDEX_NAME"),
        entriesQuery: {
          populate: [
            "profile",
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

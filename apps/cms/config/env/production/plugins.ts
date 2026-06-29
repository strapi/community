// n8n webhook path namespace — mirrors config/plugins.ts so the moderation webhook
// paths resolve correctly on Strapi Cloud (which uses the production config).
// Defaults to "strapi"; set N8N_WEBHOOK_NAMESPACE per environment (e.g. "staging").
const N8N_WEBHOOK_NS = process.env.N8N_WEBHOOK_NAMESPACE || "strapi";

export default ({ env }) => ({
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"),
      },
      settings: {
        defaultFrom: env("EMAIL_DEFAULT_FROM", "community@strapi.io"),
        defaultReplyTo: env("EMAIL_DEFAULT_REPLY_TO", "community@strapi.io"),
      },
    },
  },
  upload: {
    config: {
      security: {
        strictSsrf: true,
      },
    },
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
});

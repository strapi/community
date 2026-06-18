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
});

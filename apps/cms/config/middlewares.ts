export default ({ env }) => [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "dl.airtable.com",
            "cdn2.iconfinder.com", // Base URL of the provider's logo
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "dl.airtable.com",
            "cdn2.iconfinder.com", // Base URL of the provider's logo
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: "strapi::cors",
    config: {
      // Strapi's own default (`origin: '*'`) reflects *any* request Origin
      // verbatim while still sending `Access-Control-Allow-Credentials:
      // true` — effectively "allow every website, with cookies". The
      // better-auth extension's custom content-api routes (organizations/
      // users/packages/templates — see `extensions/better-auth`) are
      // deliberately cookie-authenticated (`is-authenticated` policy) with
      // no CSRF token of their own, so an unrestricted origin here would
      // let any external site ride a logged-in visitor's session to read
      // or modify their account data. Restrict to the web app's own origin
      // instead.
      origin: [env("WEBSITE_URL")],
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];

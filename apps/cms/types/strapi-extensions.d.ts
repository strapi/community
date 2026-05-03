import type {} from "@strapi/types/dist/core/strapi";

declare module "@strapi/types/dist/core/strapi" {
  interface StrapiInternalConfig {
    "better-auth": import("better-auth").Auth;
  }

  interface Strapi {
    internal_config: StrapiInternalConfig;
  }
}

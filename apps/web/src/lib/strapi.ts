import { createTypedStrapiClient } from "@repo/strapi-client";

export const client: ReturnType<typeof createTypedStrapiClient> = createTypedStrapiClient({
  baseURL: process.env.CMS_BASE_URL || 'http://localhost:1337/api',
  auth: process.env.CMS_BEARER_TOKEN,
});

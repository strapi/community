import { createTypedStrapiClient } from "@repo/strapi-client";

export const client: ReturnType<typeof createTypedStrapiClient> = createTypedStrapiClient({
  baseURL: `${process.env.NEXT_PUBLIC_CMS_URL}/api` || 'http://localhost:1337/api',
  auth: process.env.CMS_BEARER_TOKEN,
});
import { strapi } from "@strapi/client";

export const client = strapi({
  baseURL: process.env.CMS_BASE_URL || 'http://localhost:1337/api',
  auth: process.env.CMS_BEARER_TOKEN,
});
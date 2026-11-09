import type { Core } from "@strapi/strapi";
import { seedRoadmapPage } from "./seed/roadmap-page";
import { migrateProfileLinks } from "./migration/profile-links";

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await seedRoadmapPage(strapi);

    if (process.env.ENABLE_MIGRATION !== "true") {
      return;
    }

    await migrateProfileLinks();
  },
};

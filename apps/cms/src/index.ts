import { migrateProfileLinks } from "./migration/profile-links";

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap() {
    if (process.env.ENABLE_MIGRATION !== "true") {
      return;
    }

    await migrateProfileLinks();
  },
};

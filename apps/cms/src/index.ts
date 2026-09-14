import type { Core } from "@strapi/strapi";
import { migrateReadmeAutoSync } from "./migration/readme-auto-sync";
import { migrateUserProfilePictures } from "./migration/user-profile-pictures";
import { migrateUserSlugs } from "./migration/user-slugs";
import { seedEmailTemplates } from "./seed/email-templates";

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await seedEmailTemplates(strapi);

    if (process.env.ENABLE_MIGRATION !== "true") {
      return;
    }

    await migrateUserProfilePictures();
    await migrateUserSlugs();
    await migrateReadmeAutoSync();
  },
};

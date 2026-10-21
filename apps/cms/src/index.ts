import type { Core } from "@strapi/strapi";
import { migrateReadmeAutoSync } from "./migration/readme-auto-sync";
import { migrateUserProfilePictures } from "./migration/user-profile-pictures";
import { migrateUserSlugs } from "./migration/user-slugs";
import { seedEmailTemplates } from "./seed/email-templates";
import { seedPartnerProgram } from "./seed/partner-program";
import { seedPartnerResources } from "./seed/partner-resources";

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await seedEmailTemplates(strapi);
    await seedPartnerProgram(strapi);
    await seedPartnerResources(strapi);

    if (process.env.ENABLE_MIGRATION !== "true") {
      return;
    }

    await migrateUserProfilePictures();
    await migrateUserSlugs();
    await migrateReadmeAutoSync();
  },
};

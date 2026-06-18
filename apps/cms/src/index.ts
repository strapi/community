import type { Core } from "@strapi/strapi";
import { migrateIntegrations } from "./migration/integrations";
import { migratePartners } from "./migration/partners";
import { migratePlugins } from "./migration/plugins";
import { migrateProviders } from "./migration/providers";
import { migrateShowcases } from "./migration/showcases";
import { seedEmailTemplates } from "./seed/email-templates";

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await seedEmailTemplates(strapi);

    if (process.env.ENABLE_MIGRATION !== "true") {
      return;
    }

    await migratePartners();
    await migrateIntegrations();
    await migratePlugins();
    await migrateProviders();
    await migrateShowcases();
  },
};

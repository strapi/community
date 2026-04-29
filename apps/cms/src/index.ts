// import type { Core } from '@strapi/strapi';
import { migrateIntegrations } from "./migration/integrations";
import { migratePartners } from "./migration/partners";
import { migratePlugins } from "./migration/plugins";
import { migrateProviders } from "./migration/providers";
import { migrateShowcases } from "./migration/showcases";

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {
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

import { syncStats } from "./cron/sync-stats";
import { syncVersionInfo } from "./cron/sync-version-info";

export default {
  bootstrap() {
    strapi.cron.add({
      syncStats: {
        task: async () => {
          strapi.log.info("[package-info] Starting daily stats sync");
          const { updated, failed } = await syncStats();
          strapi.log.info(
            `[package-info] Daily stats sync done — updated: ${updated}, failed: ${failed}`,
          );
        },
        options: {
          rule: "0 2 * * *",
        },
      },

      syncVersionInfo: {
        task: async () => {
          strapi.log.info("[package-info] Starting hourly version info sync");
          const { updated, failed } = await syncVersionInfo();
          strapi.log.info(
            `[package-info] Hourly version info sync done — updated: ${updated}, failed: ${failed}`,
          );
        },
        options: {
          rule: "0 * * * *",
        },
      },
    });
  },
};

const bootstrap = () => {
  /**
   * Daily cron — sync stars and downloads for all packages + stars for all templates.
   * Runs at 02:00 every day.
   */
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

    /**
     * Hourly cron — sync version info for all packages.
     */
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
};

module.exports = bootstrap;

import controllers from "./controllers";
import routes from "./routes";
import { isNotionConfigured } from "./services/notion";
import { runRoadmapSync } from "./sync";

export default {
  bootstrap({ strapi }) {
    if (!isNotionConfigured()) {
      strapi.log.info(
        "[roadmap-sync] NOTION_API_TOKEN / NOTION_DATA_SOURCE_ID not set — nightly sync disabled.",
      );
      return;
    }

    strapi.cron.add({
      roadmapSync: {
        // Nightly, after package-info's 2 AM stats sync. Monday's run also
        // sends the needs-attention digest; failures always report.
        task: async () => {
          await runRoadmapSync({
            trigger: "cron",
            sendReport: new Date().getDay() === 1,
          });
        },
        options: { rule: "0 3 * * *" },
      },
    });

    // Local dev convenience: sync once at boot instead of waiting for 3 AM.
    if (process.env.ROADMAP_SYNC_ON_BOOTSTRAP === "true") {
      runRoadmapSync({ trigger: "bootstrap" }).catch((err) =>
        strapi.log.error(`[roadmap-sync] Bootstrap sync failed: ${err}`),
      );
    }
  },

  controllers,
  routes,
};

import type { Core } from "@strapi/strapi";
import controllers from "./controllers";
import routes from "./routes";
import { seedHelpPages } from "./seed/help-pages";
import services from "./services";

/**
 * Contributions: a user's GitHub contributions to `strapi/strapi` and the
 * `strapi-community` organization — the "GitHub Contributions" tab on
 * public profiles, and the contribution score / contributor tier stored
 * on the better-auth user (`contribution_score`, `contributor_tier`, plus
 * the `strapi_employee` / `former_strapi_employee` flags that exclude
 * Strapi staff from tiers).
 */
export default {
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await seedHelpPages(strapi);

    // Skipped while migrating (when meilisearch is disabled too) — nothing
    // should write to users mid-migration.
    if (process.env.ENABLE_MIGRATION === "true") return;

    const tiers = strapi.plugin("contributions").service("tiers");

    // Database-only, so employee tags show right after a deploy rather
    // than after the first nightly run.
    await tiers.syncStrapiEmployees();

    strapi.cron.add({
      contributionsSyncTiers: {
        task: async () => {
          strapi.log.info("[contributions] Starting daily tier sync");
          const { synced, failed } = await tiers.syncAll();
          strapi.log.info(
            `[contributions] Daily tier sync done — synced: ${synced}, failed: ${failed}`,
          );
        },
        options: { rule: "0 3 * * *" },
      },
    });
  },
  controllers,
  routes,
  services,
};

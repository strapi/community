import type { Core } from "@strapi/strapi";
import contentTypes from "./content-types";
import controllers from "./controllers";
import routes from "./routes";
import { seedHelpPages } from "./seed/help-pages";
import { seedTierBenefits } from "./seed/tier-benefits";
import services from "./services";
import {
  findSubmissionUserOwner,
  SUBMISSION_TABLES,
  type SubmissionUid,
} from "./utils/submissions";

/**
 * Contributions: a user's GitHub contributions to the `strapi` and
 * `strapi-community` organization — the "GitHub Contributions" tab on
 * public profiles, and the contribution score / contributor tier stored
 * on the better-auth user (`contribution_score`, `contributor_tier`;
 * Strapi employees are excluded, see the `employees` service) — and the personal contributions dashboard in
 * the web app's account settings (tier progress, benefits per tier from
 * `tier-benefit`, and issues to pick up).
 */
export default {
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await seedHelpPages(strapi);
    await seedTierBenefits(strapi);

    // Skipped while migrating (when meilisearch is disabled too) — nothing
    // should write to users mid-migration.
    if (process.env.ENABLE_MIGRATION === "true") return;

    const tiers = strapi.plugin("contributions").service("tiers");
    const employees = strapi.plugin("contributions").service("employees");

    // Someone removed from the Strapi team's organization becomes a former
    // employee. Hooked on the `member` rows themselves, so it applies
    // however they're removed (removed by an admin, left, dashboard). The
    // rows are read before deletion, since only `where` is known then.
    const readMembers = (event) =>
      strapi.db.query("plugin::better-auth.member").findMany({
        where: event.params.where,
        select: ["userId", "organizationId"],
      });
    const markFormer = async (event) => {
      try {
        await employees.onMembersRemoved(event.state.removedMembers ?? []);
      } catch (error) {
        strapi.log.error(
          `[contributions] Failed to mark former employees: ${error}`,
        );
      }
    };
    strapi.db.lifecycles.subscribe({
      models: ["plugin::better-auth.member"],
      async beforeDelete(event) {
        event.state.removedMembers = await readMembers(event);
      },
      async beforeDeleteMany(event) {
        event.state.removedMembers = await readMembers(event);
      },
      afterDelete: markFormer,
      afterDeleteMany: markFormer,
    });

    // A plugin or template earns its owner points the moment it's approved
    // (publishing creates the published row), rather than at the next
    // nightly run. In the background — it also re-checks GitHub, and
    // publishing shouldn't wait for (or fail on) that.
    strapi.db.lifecycles.subscribe({
      models: Object.keys(SUBMISSION_TABLES),
      async afterCreate(event) {
        const result = event.result as { id?: number; publishedAt?: unknown };
        if (!result?.id || !result.publishedAt) return;

        const uid = event.model.uid as SubmissionUid;
        const id = result.id;
        setImmediate(async () => {
          try {
            const ownerId = await findSubmissionUserOwner(strapi, uid, id);
            if (ownerId) await tiers.syncUser({ userId: ownerId });
          } catch (error) {
            strapi.log.warn(
              `[contributions] Failed to update points after publishing ${uid} ${id}: ${error}`,
            );
          }
        });
      },
    });

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
  contentTypes,
  controllers,
  routes,
  services,
};

import { timingSafeEqual } from "node:crypto";
import { isSyncRunning, runRoadmapSync } from "../sync";

/**
 * Manual trigger: `POST /api/roadmap-sync/run` with header
 * `X-Roadmap-Sync-Secret: $ROADMAP_SYNC_SECRET`. For n8n or a one-off curl
 * after an editorial pass in Notion, without waiting for the nightly cron.
 *
 * A shared secret rather than an API token: Strapi's empty-scope token auth
 * would let *any* token (including the web app's read-only one) trigger it.
 */

function secretMatches(given: unknown): boolean {
  const expected = process.env.ROADMAP_SYNC_SECRET;
  if (!expected || typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default {
  sync: {
    async run(ctx) {
      if (!process.env.ROADMAP_SYNC_SECRET) return ctx.notFound();
      if (!secretMatches(ctx.get("x-roadmap-sync-secret"))) {
        return ctx.unauthorized("Invalid roadmap sync secret");
      }

      const body = (ctx.request.body ?? {}) as { report?: boolean };
      const alreadyRunning = isSyncRunning();
      const report = await runRoadmapSync({
        trigger: "http",
        sendReport: body.report === true,
      });

      ctx.status = report.ok ? 200 : 502;
      ctx.body = { joinedRunningSync: alreadyRunning, ...report };
    },
  },
};

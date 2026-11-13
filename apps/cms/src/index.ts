import { refreshImpersonationAdmins } from "./lib/auth-impersonation";
import { migrateProfileLinks } from "./migration/profile-links";
export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap() {
    // Seed the impersonation admin allowlist from the Strapi team org's
    // owner/admin members; kept current afterwards by the org member hooks in
    // `lib/auth.ts`. Isolated so a failure here never takes down the whole
    // CMS — impersonation just stays off.
    try {
      await refreshImpersonationAdmins();
    } catch (error) {
      strapi.log.error(
        `[impersonation] failed to seed admin user ids: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    if (process.env.ENABLE_MIGRATION !== "true") {
      return;
    }

    await migrateProfileLinks();
  },
};

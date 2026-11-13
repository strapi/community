import type { Core } from "@strapi/strapi";
import { migrateUserProfilePictures } from "./migration/user-profile-pictures";
import { seedEmailTemplates } from "./seed/email-templates";
import { seedPartnerProgram } from "./seed/partner-program";
import { seedPartnerResources } from "./seed/partner-resources";
import { seedSeoContent } from "./seed/seo-content";

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await seedEmailTemplates(strapi);
    await seedPartnerProgram(strapi);
    await seedPartnerResources(strapi);
    await seedSeoContent(strapi);

    // Seed the impersonation admin allowlist from the Strapi team org's
    // owner/admin members; kept current afterwards by the org member hooks
    // in `lib/auth.ts`. Imported lazily (not at module top) so `betterAuth()`
    // isn't initialized before `strapi` is ready, and isolated so a failure
    // here never takes down the whole CMS — impersonation just stays off.
    try {
      const { refreshImpersonationAdmins } = await import("./lib/auth");
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

    await migrateUserProfilePictures();
  },
};

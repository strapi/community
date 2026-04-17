import type { Core } from "@strapi/strapi";

import { seedEmailTemplates } from "./seed/email-templates";

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await seedEmailTemplates(strapi);
  },
};

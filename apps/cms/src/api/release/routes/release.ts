/**
 * release router
 *
 * Public, read-only — same model as api::roadmap-item. Rows are written only
 * by the roadmap-sync plugin (GitHub releases + open milestones).
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::release.release", {
  only: ["find", "findOne"],
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});

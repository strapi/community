/**
 * roadmap-item router
 *
 * Public, read-only: only `find` / `findOne` are exposed and neither needs a
 * token (the controller pins reads to published content). Writes happen
 * exclusively through the roadmap-sync plugin's internal document API calls.
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::roadmap-item.roadmap-item", {
  only: ["find", "findOne"],
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});

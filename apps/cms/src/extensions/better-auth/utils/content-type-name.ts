import type { UID } from "@strapi/strapi";

/**
 * Factored out of the utils barrel (`./index`) so `cascade-delete.ts` can
 * import it without creating a circular import with that barrel.
 */
export const extractContentTypeName = (uid: UID.ContentType) =>
  uid.split(".")[1];

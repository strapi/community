/**
 * Backfills `readme_auto_sync` for every existing package/template created
 * before that field existed — their column is `null` in the database (the
 * schema's `default: true` only applies to rows created after the field
 * was added), which several read paths (the readme-sync crons, the
 * "Submissions" edit form) already treat as `true` defensively, but a
 * `null` in the database is still surprising to find later. Sets it to
 * `true` (syncing enabled — the intended default) for every draft and
 * published row that hasn't been touched yet.
 */
export const migrateReadmeAutoSync = async () => {
  strapi.log.info("Starting readme_auto_sync migration...");
  let migrated = 0;
  let failed = 0;

  for (const uid of [
    "api::package.package",
    "api::template.template",
  ] as const) {
    for (const status of ["draft", "published"] as const) {
      const entries = await strapi.documents(uid).findMany({
        status,
        fields: ["documentId"],
        filters: { readme_auto_sync: { $null: true } },
      });

      for (const entry of entries) {
        try {
          await strapi.documents(uid).update({
            status,
            documentId: entry.documentId,
            data: { readme_auto_sync: true },
          });
          migrated++;
        } catch (error) {
          failed++;
          strapi.log.error(
            `Error migrating readme_auto_sync for ${uid} ${entry.documentId}:`,
            error,
          );
        }
      }
    }
  }

  strapi.log.info(
    `readme_auto_sync migration finished. Migrated: ${migrated}, Failed: ${failed}`,
  );
};

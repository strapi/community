import { generateUniqueUserSlug } from "../utils/slugify";

/**
 * Backfills `slug` for every existing user that doesn't have one yet.
 *
 * The slug is copied verbatim from the user's *current, live*
 * `plugin::webtools.url-alias.url_path` (minus the leading `/`) rather than
 * freshly re-slugified from `name` — that guarantees a byte-for-byte match
 * with the URL the user already has, including any historical `-0`/`-1`
 * collision suffix webtools assigned, or a manually-overridden alias that
 * no longer matches `slugify(name)` at all. Only users with no alias at
 * all (shouldn't normally happen, since webtools generates one on create)
 * fall back to generating a fresh unique slug from `name`.
 *
 * This is a one-off step in the migration to repoint the `plugin::better-
 * auth.user` URL pattern from `/[name]` to `/[slug]` without moving anyone's
 * existing profile URL — see the "personal profile settings" plan for the
 * full rollout order.
 */
export const migrateUserSlugs = async () => {
  strapi.log.info("Starting user slugs migration...");
  let migrated = 0;
  let fromAlias = 0;
  let generated = 0;
  let failed = 0;

  const users = await strapi.documents("plugin::better-auth.user").findMany({
    fields: ["documentId", "name"],
    filters: { slug: { $null: true } },
    populate: { url_alias: { fields: ["url_path"] } },
  });

  for (const user of users) {
    try {
      const existingPath = user.url_alias?.[0]?.url_path;
      const slug = existingPath
        ? existingPath.replace(/^\//, "")
        : await generateUniqueUserSlug(user.name);

      if (existingPath) fromAlias++;
      else generated++;

      await strapi.documents("plugin::better-auth.user").update({
        documentId: user.documentId,
        data: { slug },
      });
      migrated++;
    } catch (error) {
      failed++;
      strapi.log.error(
        `Error migrating slug for user ${user.documentId}:`,
        error,
      );
    }
  }

  strapi.log.info(
    `User slugs migration finished. Migrated: ${migrated} (${fromAlias} from existing URL, ${generated} generated from name), Failed: ${failed}`,
  );
};

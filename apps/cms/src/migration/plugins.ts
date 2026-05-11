import Airtable from "airtable";
import { findOrCreateAuthor } from "./users-organizations";
import { uploadFromUrl } from "./utils";

const airtableInstance = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
});
const base = airtableInstance.base(process.env.AIRTABLE_MARKET_BASE_ID);

const PLUGINS_TABLE = "Plugins";
const PLUGINS_VIEW = "PROXY_API";

export const getPlugins = async () => {
  const baseTable = base.table(PLUGINS_TABLE);
  const results = await baseTable
    .select({
      view: PLUGINS_VIEW,
    })
    .all();
  return results;
};

export const migratePlugins = async () => {
  strapi.log.info("Starting plugins migration...");
  let migrated = 0;
  let skipped = 0;
  let failed = 0;
  const plugins = await getPlugins();
  for (const plugin of plugins) {
    try {
      const existingPackage = await strapi
        .documents("api::package.package")
        .findFirst({
          fields: [],
          filters: {
            slug: plugin.fields["Slug"] as string,
          },
        });
      if (existingPackage) {
        skipped++;
        continue;
      }
      const author = await findOrCreateAuthor(
        plugin.fields["Developer email"],
        plugin.fields["Developer name"],
        plugin.fields["Repository URL"],
        plugin.fields["Submission date"],
      );
      const logoUrl = plugin.fields["Logo URL"]?.[0];
      const logoKey = plugin.fields["Logo Key"]?.[0];
      let icon = null;
      if (logoUrl && logoKey) {
        icon = await uploadFromUrl(
          logoUrl,
          logoKey.split("/").pop() || logoKey,
        );
      }
      await strapi.documents("api::package.package").create({
        status: "published",
        data: {
          name: plugin.fields["Name"] as string,
          createdAt: plugin.fields["Submission date"] as string,
          description: plugin.fields["Description"] as string,
          type: plugin.fields["Type"] as "plugin",
          package_location: plugin.fields["npm package URL"] as string,
          git_repository: plugin.fields["Repository URL"] as string,
          stars: plugin.fields["GitHub stars"] as number,
          icon: icon?.id,
          monthly_downloads: plugin.fields["npm downloads"] as number,
          maintainers: [author.author.documentId],
          owner: {
            __type: author.type,
            id: author.author.id,
          },
          slug: plugin.fields["Slug"] as string,
        },
      });
      migrated++;
    } catch (error) {
      failed++;
      strapi.log.error(
        `Error migrating plugin ${plugin.fields["Name"]}:`,
        error,
      );
    }
  }
  strapi.log.info(
    `Plugins migration finished. Migrated: ${migrated}, Skipped: ${skipped}, Failed: ${failed}`,
  );
};

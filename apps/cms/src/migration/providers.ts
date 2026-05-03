import Airtable from "airtable";
import { findOrCreateAuthor } from "./users-organizations";
import { uploadFromUrl } from "./utils";

const airtableInstance = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
});
const base = airtableInstance.base(process.env.AIRTABLE_MARKET_BASE_ID);

const PLUGINS_TABLE = "Providers";
const PLUGINS_VIEW = "PROXY_API";

export const getProviders = async () => {
  const baseTable = base.table(PLUGINS_TABLE);
  const results = await baseTable
    .select({
      view: PLUGINS_VIEW,
    })
    .all();
  return results;
};

export const migrateProviders = async () => {
  strapi.log.info("Starting providers migration...");
  let migrated = 0;
  let skipped = 0;
  let failed = 0;
  const providers = await getProviders();
  for (const provider of providers) {
    try {
      const existingPackage = await strapi
        .documents("api::package.package")
        .findFirst({
          fields: [],
          filters: {
            slug: provider.fields["Slug"] as string,
          },
        });
      if (existingPackage) {
        skipped++;
        continue;
      }
      const author = await findOrCreateAuthor(
        provider.fields["Developer email"],
        provider.fields["Developer name"],
        provider.fields["Repository URL"],
        provider.fields["Submission date"],
      );
      const logoUrl = provider.fields["Logo URL"]?.[0];
      const logoKey = provider.fields["Logo Key"]?.[0];
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
          name: provider.fields["Name"] as string,
          description: provider.fields["Description"] as string,
          type: provider.fields["Type"] as "provider",
          package_location: provider.fields["npm package URL"] as string,
          git_repository: provider.fields["Repository URL"] as string,
          stars: provider.fields["GitHub stars"] as number,
          icon: icon?.id,
          monthly_downloads: provider.fields["npm downloads"] as number,
          maintainers: [author.author.documentId],
          owner: [
            {
              __type: author.type,
              id: author.author.id,
            },
          ],
          slug: provider.fields["Slug"] as string,
        },
      });
      migrated++;
    } catch (error) {
      failed++;
      strapi.log.error(
        `Error migrating provider ${provider.fields["Name"]}:`,
        error,
      );
    }
  }
  strapi.log.info(
    `Providers migration finished. Migrated: ${migrated}, Skipped: ${skipped}, Failed: ${failed}`,
  );
};

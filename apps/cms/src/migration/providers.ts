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
  const providers = await getProviders();
  for (const provider of providers) {
    console.log(`Processing provider: `, provider.fields["Name"]);
    const existingPackage = await strapi
      .documents("api::package.package")
      .findFirst({
        fields: [],
        filters: {
          airtableSlug: provider.fields["Slug"] as string,
        },
      });
    if (existingPackage) {
      continue;
    }
    const author = await findOrCreateAuthor(
      provider.fields["Developer email"],
      provider.fields["Developer name"],
      provider.fields["Repository URL"],
    );
    const logoUrl = provider.fields["Logo URL"]?.[0];
    const logoKey = provider.fields["Logo Key"]?.[0];
    let icon = null;
    if (logoUrl && logoKey) {
      icon = await uploadFromUrl(logoUrl, logoKey.split("/").pop() || logoKey);
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
        airtableSlug: provider.fields["Slug"] as string,
      },
    });
  }
};

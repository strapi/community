import { createCategories, uploadFromUrl, uploadMarkdownImages } from "./utils";

export const migrateIntegrations = async () => {
  strapi.log.info("Starting integrations migration...");
  try {
    const firstPage = (await fetch(
      "https://api-prod.strapi.io/api/integrations?pagination[pageSize]=100",
    ).then((res) => res.json())) as any;

    const allIntegrations = [...firstPage.data];

    for (let page = 2; page <= firstPage.meta.pagination.pageCount; page++) {
      const nextPage = (await fetch(
        `https://api-prod.strapi.io/api/integrations?pagination[pageSize]=100&pagination[page]=${page}`,
      ).then((res) => res.json())) as any;
      allIntegrations.push(...nextPage.data);
    }

    await Promise.all(
      allIntegrations.map(async (integration) => {
        let icon = null;
        let image = null;

        if (integration.attributes.logo?.media?.data?.attributes?.url) {
          icon = await uploadFromUrl(
            integration.attributes.logo.media.data.attributes.url,
            integration.attributes.logo.media.data.attributes.name,
          );
        }

        if (integration.attributes.image?.media?.data?.attributes?.url) {
          image = await uploadFromUrl(
            integration.attributes.image.media.data.attributes.url,
            integration.attributes.image.media.data.attributes.name,
          );
        }

        const categories = await createCategories(
          "api::integration-category.integration-category",
          integration.attributes.integration_tags?.data || [],
        );

        const markdown = await uploadMarkdownImages(
          integration.attributes.content || "",
        );

        await strapi.documents("api::integration.integration").create({
          status: "published",
          data: {
            name: integration.attributes.title,
            slug: integration.attributes.slug,
            description: integration.attributes.description,
            content: markdown,
            logo: icon?.id,
            image: image?.id,
            categories: categories,
            seo: {
              metaTitle:
                integration.attributes.seo?.metaTitle ||
                integration.attributes.title,
              metaDescription:
                integration.attributes.seo?.metaDescription ||
                integration.attributes.description,
              keywords: integration.attributes.seo?.keywords,
              metaImage: image?.id,
            },
          },
        });
      }),
    );
  } catch (error) {
    strapi.log.error("Error migrating integrations:", error);
  } finally {
    strapi.log.info("Integrations migration finished.");
  }
};

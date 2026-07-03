import { createCategories, uploadFromUrl, uploadMarkdownImages } from "./utils";

const FAQ_POPULATE = "populate[slices][populate][categories][populate]=*";

const extractFaqQuestions = (slices) => {
  if (!Array.isArray(slices)) return [];
  return slices
    .filter((s) => s.__component === "slices.faq")
    .flatMap((slice) =>
      (slice.categories || []).flatMap((cat) =>
        (cat.questions || []).filter((q) => q.question && q.answer),
      ),
    );
};

const getFaqSectionTitle = (slices) => {
  if (!Array.isArray(slices)) return "Frequently Asked Questions";
  const faqSlice = slices.find((s) => s.__component === "slices.faq");
  return faqSlice?.categories?.[0]?.name || "Frequently Asked Questions";
};

const createFaqItems = async (slices) => {
  const questions = extractFaqQuestions(slices);
  const documentIds: string[] = [];
  for (const q of questions) {
    const item = await strapi.documents("api::faq-item.faq-item").create({
      data: { question: q.question, answer: q.answer },
    });
    documentIds.push(item.documentId);
  }
  return documentIds;
};

export const migrateIntegrations = async () => {
  strapi.log.info("Starting integrations migration...");
  let migrated = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  const firstPage = (await fetch(
    `https://api-prod.strapi.io/api/integrations?pagination[pageSize]=100&${FAQ_POPULATE}`,
  ).then((res) => res.json())) as any;

  const allIntegrations = [...firstPage.data];

  for (let page = 2; page <= firstPage.meta.pagination.pageCount; page++) {
    const nextPage = (await fetch(
      `https://api-prod.strapi.io/api/integrations?pagination[pageSize]=100&pagination[page]=${page}&${FAQ_POPULATE}`,
    ).then((res) => res.json())) as any;
    allIntegrations.push(...nextPage.data);
  }

  for (const integration of allIntegrations) {
    try {
      const existing = await strapi
        .documents("api::integration.integration")
        .findFirst({
          filters: { slug: integration.attributes.slug },
          populate: { faq_items_section: { populate: { items: true } } },
        });

      const slices = integration.attributes.slices || [];

      if (existing) {
        // Already migrated — update FAQ items if missing
        const hasFaqItems = existing.faq_items_section?.items?.length > 0;

        if (hasFaqItems) {
          skipped++;
          continue;
        }

        const faqItemIds = await createFaqItems(slices);
        if (faqItemIds.length > 0) {
          await strapi.documents("api::integration.integration").update({
            documentId: existing.documentId,
            status: "published",
            data: {
              faq_items_section: {
                title: getFaqSectionTitle(slices),
                items: faqItemIds,
              },
            },
          });
          updated++;
        } else {
          skipped++;
        }
        continue;
      }

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

      const faqItemIds = await createFaqItems(slices);

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
          ...(faqItemIds.length > 0 && {
            faq_items_section: {
              title: getFaqSectionTitle(slices),
              items: faqItemIds,
            },
          }),
        },
      });
      migrated++;
    } catch (error) {
      failed++;
      strapi.log.error(
        `Error migrating integration ${integration.attributes.slug}:`,
        error,
      );
    }
  }

  strapi.log.info(
    `Integrations migration finished. Migrated: ${migrated}, Updated (FAQ): ${updated}, Skipped: ${skipped}, Failed: ${failed}`,
  );
};

import { createCategories, uploadFromUrl } from "./utils";

export const migratePartners = async () => {
  strapi.log.info("Starting partners migration...");
  try {
    const partners = (await fetch(
      "https://api-prod.strapi.io/api/partners?pagination[pageSize]=100",
    ).then((res) => res.json())) as any;

    await Promise.all(
      partners.data.map(async (partner) => {
        let logo = null;

        if (partner.attributes.logo?.media?.data?.attributes?.url) {
          logo = await uploadFromUrl(
            partner.attributes.logo.media.data.attributes.url,
            partner.attributes.logo.media.data.attributes.name,
          );
        }

        const countries = await createCategories(
          "api::country.country",
          partner.attributes.location?.countries?.data || [],
        );
        const services = await createCategories(
          "api::service.service",
          partner.attributes.services?.data || [],
        );
        const techStacks = await createCategories(
          "api::tech-stack.tech-stack",
          partner.attributes.techStacks?.data || [],
        );

        const profile = await strapi.documents("api::profile.profile").create({
          data: {
            bio: partner.attributes.seo.metaDescription,
            readme: partner.attributes.intro.text,
            avatar: logo?.id,
            countries: countries,
            services: services,
            tech_stacks: techStacks,
            subtitle: partner.attributes.intro.label,
            website: partner.attributes.intro.button?.[0]?.link?.href,
          },
        });

        await strapi.documents("plugin::better-auth.organization").create({
          status: "published",
          data: {
            createdAt: partner.attributes.createdAt,
            name: partner.attributes.intro.title,
            profile: profile.id,
            slug: partner.attributes.slug,
            partner: true,
            partner_level: partner.attributes.level,
          },
        });
      }),
    );
  } catch (error) {
    strapi.log.error("Error migrating partners:", error);
  } finally {
    strapi.log.info("Partners migration finished.");
  }
};

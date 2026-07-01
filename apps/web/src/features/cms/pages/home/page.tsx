import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { cmsClient } from "@/features/cms/lib/strapi";
import { HomeTemplate } from "@/features/cms/pages/home";

const contentType = "api::home.home" satisfies UID.ContentType;

const query = {
  populate: {
    cta_buttons: true,
    sections: {
      populate: "*",
      on: {
        "sections.cta": {
          populate: {
            cta: {
              populate: {
                image: true,
                button: true,
              },
            },
          },
        },
        "sections.highlights": {
          populate: {
            button: true,
            packages: {
              populate: {
                icon: true,
                url_alias: true,
                labels: true,
                owner: true,
              },
            },
            templates: {
              populate: {
                preview_image: true,
                url_alias: true,
                labels: true,
                owner: true,
              },
            },
            integrations: {
              populate: { logo: true, url_alias: true, labels: true },
            },
          },
        },
      },
    },
  },
} satisfies GetQueryParams<typeof contentType>;
export type HomePageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

const packagesQuery = {
  populate: ["icon", "owner", "url_alias"],
  filters: {
    labels: {
      featured: {
        $eq: true,
      },
    },
  },
  // @ts-expect-error - issue in the strapi-client
  pagination: {
    limit: 3,
  },
} satisfies GetQueryParams<"api::package.package">;
export type HomePackages = Modules.Documents.Result<
  "api::package.package",
  typeof packagesQuery
>[];

const templatesQuery = {
  populate: ["preview_image", "owner", "url_alias"],
  filters: {
    labels: {
      featured: {
        $eq: true,
      },
    },
  },
  // @ts-expect-error - issue in the strapi-client
  pagination: {
    limit: 3,
  },
} satisfies GetQueryParams<"api::template.template">;
export type HomeTemplates = Modules.Documents.Result<
  "api::template.template",
  typeof templatesQuery
>[];

const HomePage = async () => {
  const templates = await cmsClient
    .collection("api::template.template")
    .find(templatesQuery);
  const packages = await cmsClient
    .collection("api::package.package")
    .find(packagesQuery);
  const document = await cmsClient.single(contentType).find(query);

  return (
    <HomeTemplate
      document={document.data}
      templates={templates.data}
      packages={packages.data}
    />
  );
};

export { HomePage };

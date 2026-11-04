import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { JsonLd } from "@/components/content/json-ld";
import { PageContext } from "@/features/analytics";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import { cmsClient } from "@/features/cms/lib/strapi";
import { articleSchema, faqSchema } from "@/features/cms/lib/structured-data";
import { IntegrationTemplate } from "@/features/cms/pages/integrations";

const contentType = "api::integration.integration" satisfies UID.ContentType;

const query = {
  populate: {
    categories: true,
    logo: true,
    templates: {
      populate: {
        url_alias: true,
        preview_image: true,
      },
    },
    packages: {
      populate: {
        url_alias: true,
        icon: true,
      },
    },
    faq_items_section: {
      populate: {
        items: true,
      },
    },
  },
} satisfies GetQueryParams<typeof contentType>;

export type IntegrationPageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

type Props = {
  documentId: string;
  path: string;
};

const IntegrationPage = async ({ documentId, path }: Props) => {
  const document = await cmsClient
    .collection(contentType)
    .findOne(documentId, query);

  return (
    <>
      <PageContext
        page_type="integration_detail"
        content_id={document.data.documentId}
        content_name={document.data.name ?? undefined}
        content_category={document.data.categories?.[0]?.name ?? undefined}
      />
      <JsonLd
        data={[
          articleSchema(path, {
            title: document.data.name,
            description: document.data.description,
            imageUrl: document.data.logo
              ? cmsImageUrl(document.data.logo.url)
              : undefined,
            createdAt: document.data.createdAt,
            updatedAt: document.data.updatedAt,
          }),
          ...[faqSchema(document.data.faq_items_section?.items ?? [])].filter(
            (schema) => schema !== null,
          ),
        ]}
      />
      <IntegrationTemplate document={document.data} />
    </>
  );
};

export { IntegrationPage };

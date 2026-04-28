import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { cmsClient } from "@/features/cms/lib/strapi";
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
  },
} satisfies GetQueryParams<typeof contentType>;

export type IntegrationPageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

type Props = {
  documentId: string;
};

const IntegrationPage = async ({ documentId }: Props) => {
  const document = await cmsClient
    .collection(contentType)
    .findOne(documentId, query);

  return <IntegrationTemplate document={document.data} />;
};

export { IntegrationPage };

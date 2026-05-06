import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { cmsClient } from "@/features/cms/lib/strapi";
import { TemplateTemplate } from "@/features/cms/pages/template";

const contentType = "api::template.template" satisfies UID.ContentType;

const query = {
  populate: {
    preview_image: true,
    labels: true,
    categories: true,
    owner: {
      populate: "*",
    },
    maintainers: {
      populate: {
        profile: true,
        url_alias: true,
      },
    },
  },
} satisfies GetQueryParams<typeof contentType>;

export type TemplatePageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

type Props = {
  documentId: string;
};

const TemplatePage = async ({ documentId }: Props) => {
  const document = await cmsClient
    .collection(contentType)
    .findOne(documentId, query);

  return <TemplateTemplate document={document.data} />;
};

export { TemplatePage };

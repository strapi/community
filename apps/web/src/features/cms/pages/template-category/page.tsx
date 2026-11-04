import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { PageContext } from "@/features/analytics";
import { cmsClient } from "@/features/cms/lib/strapi";
import { TemplateCategoryTemplate } from "./template";

const contentType =
  "api::template-category.template-category" satisfies UID.ContentType;

const query = {
  populate: {
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
      },
    },
    children: {
      populate: { url_alias: true },
    },
  },
} satisfies GetQueryParams<typeof contentType>;

export type TemplateCategoryData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

type Props = {
  documentId: string;
};

const TemplateCategoryPage = async ({ documentId }: Props) => {
  const document = await cmsClient
    .collection(contentType)
    .findOne(documentId, query);

  return (
    <>
      <PageContext
        page_type="template_category"
        content_id={document.data.documentId}
        content_name={document.data.name ?? undefined}
      />
      <TemplateCategoryTemplate document={document.data} />
    </>
  );
};

export { TemplateCategoryPage };

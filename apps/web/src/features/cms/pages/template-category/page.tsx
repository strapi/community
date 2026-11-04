import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { JsonLd } from "@/components/content/json-ld";
import { PageContext } from "@/features/analytics";
import { cmsClient } from "@/features/cms/lib/strapi";
import { collectionPageSchema } from "@/features/cms/lib/structured-data";
import { categoryFilter, SEARCH_INDEXES } from "@/features/search/lib/indexes";
import { getSearchServerState } from "@/features/search/lib/server-state";
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
  path: string;
};

const TemplateCategoryPage = async ({ documentId, path }: Props) => {
  const document = await cmsClient
    .collection(contentType)
    .findOne(documentId, query);
  const searchServerState = await getSearchServerState(
    SEARCH_INDEXES.templates,
    categoryFilter(document.data.name ?? undefined),
  );

  return (
    <>
      <PageContext
        page_type="template_category"
        content_id={document.data.documentId}
        content_name={document.data.name ?? undefined}
      />
      <JsonLd data={collectionPageSchema(path, document.data)} />
      <TemplateCategoryTemplate
        document={document.data}
        searchServerState={searchServerState}
      />
    </>
  );
};

export { TemplateCategoryPage };

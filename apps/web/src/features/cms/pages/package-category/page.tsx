import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { JsonLd } from "@/components/content/json-ld";
import { PageContext } from "@/features/analytics";
import { cmsClient } from "@/features/cms/lib/strapi";
import { collectionPageSchema } from "@/features/cms/lib/structured-data";
import { categoryFilter, SEARCH_INDEXES } from "@/features/search/lib/indexes";
import { getSearchServerState } from "@/features/search/lib/server-state";
import { PackageCategoryTemplate } from "./template";

const contentType =
  "api::package-category.package-category" satisfies UID.ContentType;

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

export type PackageCategoryData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

type Props = {
  documentId: string;
  path: string;
};

const PackageCategoryPage = async ({ documentId, path }: Props) => {
  const document = await cmsClient
    .collection(contentType)
    .findOne(documentId, query);
  const searchServerState = await getSearchServerState(
    SEARCH_INDEXES.packages,
    categoryFilter(document.data.name ?? undefined),
  );

  return (
    <>
      <PageContext
        page_type="package_category"
        content_id={document.data.documentId}
        content_name={document.data.name ?? undefined}
      />
      <JsonLd data={collectionPageSchema(path, document.data)} />
      <PackageCategoryTemplate
        document={document.data}
        searchServerState={searchServerState}
      />
    </>
  );
};

export { PackageCategoryPage };

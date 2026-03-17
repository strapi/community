import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { client } from "@/features/cms/lib/strapi";
import { CategoryTemplate } from "@/features/cms/pages/category";

const contentType = "api::category.category" satisfies UID.ContentType;

const query = {
  populate: ["children"],
} satisfies GetQueryParams<typeof contentType>;

export type CategoryPageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

type Props = {
  documentId: string;
};

const CategoryPage = async ({ documentId }: Props) => {
  const document = await client
    .collection(contentType)
    .findOne(documentId, query);

  return <CategoryTemplate document={document.data} />;
};

export { CategoryPage };

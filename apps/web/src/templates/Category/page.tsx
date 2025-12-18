import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules } from "@strapi/types";
import { client } from "@/lib/strapi";
import CategoryTemplate from "@/templates/Category/template";

const contentType = "api::category.category";

const query = {} satisfies GetQueryParams<typeof contentType>;

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

export default CategoryPage;

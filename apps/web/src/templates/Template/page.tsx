import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules } from "@strapi/types";
import { client } from "@/lib/strapi";
import TemplateTemplate from "@/templates/Template/template";

const contentType = "api::template.template";

const query = {} satisfies GetQueryParams<typeof contentType>;

export type TemplatePageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

type Props = {
  documentId: string;
};

const TemplatePage = async ({ documentId }: Props) => {
  const document = await client
    .collection(contentType)
    .findOne(documentId, query);

  return <TemplateTemplate document={document.data} />;
};

export default TemplatePage;

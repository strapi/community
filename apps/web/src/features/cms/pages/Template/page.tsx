import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { client } from "@/features/cms/lib/strapi";
import TemplateTemplate from "@/features/cms/pages/Template/template";

const contentType = "api::template.template" satisfies UID.ContentType;

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

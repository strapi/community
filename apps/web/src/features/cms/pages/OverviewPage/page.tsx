import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { client } from "@/features/cms/lib/strapi";
import OverviewPageTemplate from "@/features/cms/pages/OverviewPage/template";

const contentType =
  "api::overview-page.overview-page" satisfies UID.ContentType;

const query = {
  populate: {
    sections: {
      populate: "*",
    },
  },
} satisfies GetQueryParams<typeof contentType>;

export type OverviewPageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

type Props = {
  documentId: string;
};

const OverviewPage = async ({ documentId }: Props) => {
  const document = await client
    .collection(contentType)
    .findOne(documentId, query);

  return <OverviewPageTemplate document={document.data} />;
};

export default OverviewPage;

import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules } from "@strapi/types";
import { client } from "@/features/cms/lib/strapi";
import PackageTemplate from "@/features/cms/pages/Package/template";

const contentType = "api::package.package";

const query = {
  populate: {
    owner: {
      populate: {
        url_alias: true,
      },
    },
  },
} satisfies GetQueryParams<typeof contentType>;

export type PackagePageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

type Props = {
  documentId: string;
};

const PackagePage = async ({ documentId }: Props) => {
  const document = await client
    .collection(contentType)
    .findOne(documentId, query);

  return <PackageTemplate document={document.data} />;
};

export default PackagePage;

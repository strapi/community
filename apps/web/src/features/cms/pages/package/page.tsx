import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { cmsClient } from "@/features/cms/lib/strapi";
import { PackageTemplate } from "@/features/cms/pages/package";

const contentType = "api::package.package" satisfies UID.ContentType;

const query = {
  populate: {
    icon: true,
    owner: {
      populate: "*",
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
  const document = await cmsClient
    .collection(contentType)
    .findOne(documentId, query);

  return <PackageTemplate document={document.data} />;
};

export { PackagePage };

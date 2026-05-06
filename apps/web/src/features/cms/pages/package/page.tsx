import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { cmsClient } from "@/features/cms/lib/strapi";
import { PackageTemplate } from "@/features/cms/pages/package";

const contentType = "api::package.package" satisfies UID.ContentType;

const query = {
  populate: {
    icon: true,
    labels: true,
    categories: true,
    version_info: true,
    owner: {
      populate: "*",
    },
    maintainers: {
      populate: {
        profile: true,
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
  const document = await cmsClient
    .collection(contentType)
    .findOne(documentId, query);

  /**
   * @todo Check for any existing security scans on the latest version.
   */
  return <PackageTemplate document={document.data} />;
};

export { PackagePage };

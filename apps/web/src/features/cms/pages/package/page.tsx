import type {
  DocumentResponseCollection,
  GetQueryParams,
} from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { cmsClient } from "@/features/cms/lib/strapi";
import { PackageTemplate } from "@/features/cms/pages/package";
import type { Owner } from "@/utils/types";

const contentType = "api::package.package" satisfies UID.ContentType;

const query = {
  populate: {
    icon: true,
    labels: true,
    categories: true,
    version_info: true,
    maintainers: {
      populate: {
        profile: {
          populate: { avatar: true },
        },
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

  const owner: DocumentResponseCollection<Owner> = await cmsClient
    .fetch(
      `/owner?contentType=${contentType}&documentId=${documentId}&populate=*`,
    )
    .then((response) => response.json());

  /**
   * @todo Check for any existing security scans on the latest version.
   */
  return <PackageTemplate document={document.data} owner={owner.data[0]!} />;
};

export { PackagePage };

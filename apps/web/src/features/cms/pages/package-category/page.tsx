import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { cmsClient } from "@/features/cms/lib/strapi";
import { PackageCategoryTemplate } from "./template";

const contentType =
  "api::package-category.package-category" satisfies UID.ContentType;

const query = {
  populate: {
    sections: {
      populate: "*",
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
};

const PackageCategoryPage = async ({ documentId }: Props) => {
  const document = await cmsClient
    .collection(contentType)
    .findOne(documentId, query);

  return <PackageCategoryTemplate document={document.data} />;
};

export { PackageCategoryPage };

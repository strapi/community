import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { cmsClient } from "@/features/cms/lib/strapi";
import { UserTemplate } from "@/features/cms/pages/user";
import type { RelatedContentItems } from "@/utils/types";

const contentType = "plugin::better-auth.user" satisfies UID.ContentType;

const query = {
  populate: ["profile"],
} satisfies GetQueryParams<typeof contentType>;

export type UserPageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

type Props = {
  documentId: string;
};

const UserPage = async ({ documentId }: Props) => {
  const document = await cmsClient
    .collection(contentType)
    .findOne(documentId, query);

  const content: RelatedContentItems = await cmsClient
    .fetch(`/users/${document.data.id}/related-content?populate=*`)
    .then((res) => res.json());

  return <UserTemplate document={document.data} relatedContent={content} />;
};

export { UserPage };

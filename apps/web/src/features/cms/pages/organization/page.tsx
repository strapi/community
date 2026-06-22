import type { GetQueryParams } from "@repo/strapi-client";
import type { Data, Modules, UID } from "@strapi/types";
import { cmsClient } from "@/features/cms/lib/strapi";
import { OrganizationTemplate } from "@/features/cms/pages/organization";
import type { RelatedContentItems } from "@/utils/types";

const contentType =
  "plugin::better-auth.organization" satisfies UID.ContentType;

const query = {
  populate: ["profile"],
} satisfies GetQueryParams<typeof contentType>;

export type OrganizationPageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

type Props = {
  documentId: string;
};

const OrganizationPage = async ({ documentId }: Props) => {
  const document = await cmsClient
    .collection(contentType)
    .findOne(documentId, query);

  const content: RelatedContentItems = await cmsClient
    .fetch(
      `/organizations/${document.data.id}/related-content?populate=*&status=published`,
      {
        method: "GET",
      },
    )
    .then((res) => res.json());

  const members: Data.ContentType<"plugin::better-auth.user">[] =
    await cmsClient
      .fetch(`/organizations/${document.data.id}/members?populate=*`, {
        method: "GET",
      })
      .then((res) => res.json());

  return (
    <OrganizationTemplate
      document={document.data}
      relatedContent={content}
      members={members}
    />
  );
};

export { OrganizationPage };

import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { JsonLd } from "@/components/content/json-ld";
import { PageContext } from "@/features/analytics";
import { fetchCommunityCTA } from "@/features/cms/lib/community-cta";
import { cmsClient } from "@/features/cms/lib/strapi";
import { personSchema } from "@/features/cms/lib/structured-data";
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
  path: string;
};

const UserPage = async ({ documentId, path }: Props) => {
  const [document, communityCta] = await Promise.all([
    cmsClient.collection(contentType).findOne(documentId, query),
    fetchCommunityCTA(),
  ]);

  const content: RelatedContentItems = await cmsClient
    .fetch(
      `/users/${document.data.id}/related-content?populate=*&status=published`,
    )
    .then((res) => res.json());

  // No content_name: member names stay out of analytics.
  return (
    <>
      <PageContext
        page_type="member_profile"
        content_id={document.data.documentId}
      />
      <JsonLd data={personSchema(path, document.data)} />
      <UserTemplate
        document={document.data}
        relatedContent={content}
        communityCta={communityCta}
      />
    </>
  );
};

export { UserPage };

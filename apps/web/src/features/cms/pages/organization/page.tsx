import type { GetQueryParams } from "@repo/strapi-client";
import type { Data, Modules, UID } from "@strapi/types";
import { JsonLd } from "@/components/content/json-ld";
import { PageContext } from "@/features/analytics";
import { fetchCommunityCTA } from "@/features/cms/lib/community-cta";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import { cmsClient } from "@/features/cms/lib/strapi";
import { organizationSchema } from "@/features/cms/lib/structured-data";
import { OrganizationTemplate } from "@/features/cms/pages/organization";
import type { RelatedContentItems } from "@/utils/types";

const contentType =
  "plugin::better-auth.organization" satisfies UID.ContentType;

const query = {
  populate: { profile: { populate: ["links"] } },
} satisfies GetQueryParams<typeof contentType>;

export type OrganizationPageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

type Props = {
  documentId: string;
  path: string;
};

const OrganizationPage = async ({ documentId, path }: Props) => {
  const [document, communityCta] = await Promise.all([
    cmsClient.collection(contentType).findOne(documentId, query),
    fetchCommunityCTA(),
  ]);

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
    <>
      <PageContext
        page_type="org_profile"
        content_id={document.data.documentId}
        content_name={document.data.name ?? undefined}
      />
      <JsonLd
        data={organizationSchema(path, {
          ...document.data,
          logoUrl: document.data.logo
            ? document.data.logo.startsWith("http")
              ? document.data.logo
              : cmsImageUrl(document.data.logo)
            : undefined,
        })}
      />
      <OrganizationTemplate
        document={document.data}
        relatedContent={content}
        members={members}
        communityCta={communityCta}
      />
    </>
  );
};

export { OrganizationPage };

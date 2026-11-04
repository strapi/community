import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { PageContext } from "@/features/analytics";
import { fetchCommunityCTA } from "@/features/cms/lib/community-cta";
import { cmsClient } from "@/features/cms/lib/strapi";
import { TemplateTemplate } from "@/features/cms/pages/template";

const contentType = "api::template.template" satisfies UID.ContentType;

const query = {
  populate: {
    preview_image: true,
    labels: true,
    categories: {
      populate: {
        url_alias: true,
      },
    },
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

export type TemplatePageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

type Props = {
  documentId: string;
};

const TemplatePage = async ({ documentId }: Props) => {
  const [document, communityCta] = await Promise.all([
    cmsClient.collection(contentType).findOne(documentId, query),
    fetchCommunityCTA(),
  ]);

  return (
    <>
      <PageContext
        page_type="template_detail"
        content_id={document.data.documentId}
        content_name={document.data.name ?? undefined}
        content_category={document.data.categories?.[0]?.name ?? undefined}
      />
      <TemplateTemplate document={document.data} communityCta={communityCta} />
    </>
  );
};

export { TemplatePage };

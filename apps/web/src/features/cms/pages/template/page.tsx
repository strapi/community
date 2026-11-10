import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { JsonLd } from "@/components/content/json-ld";
import { PageContext } from "@/features/analytics";
import { fetchCommunityCTA } from "@/features/cms/lib/community-cta";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import { cmsClient } from "@/features/cms/lib/strapi";
import { templateSchema } from "@/features/cms/lib/structured-data";
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
    // `owner` is polymorphic (user or organization). The content API drops
    // a polymorphic relation populated with `populate: "*"`, so populate
    // each possible type explicitly.
    owner: {
      on: {
        "plugin::better-auth.user": { populate: { url_alias: true } },
        "plugin::better-auth.organization": { populate: { url_alias: true } },
      },
    },
    maintainers: {
      populate: {
        profile: true,
        url_alias: true,
      },
    },
    packages: {
      populate: {
        url_alias: true,
        icon: true,
      },
    },
    integrations: {
      populate: {
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
  path: string;
};

const TemplatePage = async ({ documentId, path }: Props) => {
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
      <JsonLd
        data={templateSchema(path, {
          ...document.data,
          imageUrl: document.data.preview_image
            ? cmsImageUrl(document.data.preview_image.url)
            : undefined,
          owner: document.data.owner as never,
        })}
      />
      <TemplateTemplate document={document.data} communityCta={communityCta} />
    </>
  );
};

export { TemplatePage };

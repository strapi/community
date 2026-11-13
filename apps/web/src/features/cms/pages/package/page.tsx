import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { JsonLd } from "@/components/content/json-ld";
import { PageContext } from "@/features/analytics";
import { fetchCommunityCTA } from "@/features/cms/lib/community-cta";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import { cmsClient } from "@/features/cms/lib/strapi";
import { packageSchema } from "@/features/cms/lib/structured-data";
import { PackageTemplate } from "@/features/cms/pages/package";

const contentType = "api::package.package" satisfies UID.ContentType;

const query = {
  populate: {
    icon: true,
    labels: true,
    categories: {
      populate: {
        url_alias: true,
      },
    },
    version_info: true,
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
    integrations: {
      populate: {
        url_alias: true,
      },
    },
  },
} satisfies GetQueryParams<typeof contentType>;

export type PackagePageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

// Templates reference packages (`template.packages`), but there's no inverse
// relation on the package, so the templates using a package are fetched
// separately by filtering on that relation.
const relatedTemplatesQuery = {
  populate: {
    url_alias: true,
    preview_image: true,
    labels: true,
  },
} satisfies GetQueryParams<"api::template.template">;

export type PackageTemplateData = Modules.Documents.Result<
  "api::template.template",
  typeof relatedTemplatesQuery
>;

type Props = {
  documentId: string;
  path: string;
};

const PackagePage = async ({ documentId, path }: Props) => {
  const [document, communityCta, relatedTemplates] = await Promise.all([
    cmsClient.collection(contentType).findOne(documentId, query),
    fetchCommunityCTA(),
    cmsClient.collection("api::template.template").find({
      ...relatedTemplatesQuery,
      filters: { packages: { documentId } },
      status: "published",
    }),
  ]);

  /**
   * @todo Check for any existing security scans on the latest version.
   */
  return (
    <>
      <PageContext
        page_type="package_detail"
        content_id={document.data.documentId}
        content_name={document.data.name ?? undefined}
        content_category={document.data.categories?.[0]?.name ?? undefined}
      />
      <JsonLd
        data={packageSchema(path, {
          ...document.data,
          iconUrl: document.data.icon
            ? cmsImageUrl(document.data.icon.url)
            : undefined,
          version: document.data.version_info?.version,
          owner: document.data.owner as never,
        })}
      />
      <PackageTemplate
        document={document.data}
        relatedTemplates={relatedTemplates.data}
        communityCta={communityCta}
      />
    </>
  );
};

export { PackagePage };

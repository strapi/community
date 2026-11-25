import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { JsonLd } from "@/components/content/json-ld";
import { PageContext, type PageType } from "@/features/analytics";
import { cmsClient } from "@/features/cms/lib/strapi";
import { collectionPageSchema } from "@/features/cms/lib/structured-data";
import { OverviewPageTemplate } from "@/features/cms/pages/overview-page";

const contentType =
  "api::overview-page.overview-page" satisfies UID.ContentType;

const query = {
  populate: {
    sections: {
      populate: "*",
      on: {
        "sections.card-grid": {
          populate: {
            items: {
              populate: "*",
            },
          },
        },
        "sections.search": true,
        "sections.cta": {
          populate: {
            cta: {
              populate: {
                image: true,
                button: true,
              },
            },
          },
        },
        "sections.highlights": true,
        "sections.roadmap": true,
      },
    },
    image: true,
    cta_buttons: true,
  },
} satisfies GetQueryParams<typeof contentType>;

export type OverviewPageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

// Overview pages that are tracked as their own page type.
const PAGE_TYPES: Record<string, PageType> = {
  marketplace: "marketplace",
  roadmap: "roadmap",
};

type Props = {
  documentId: string;
  path: string;
};

const OverviewPage = async ({ documentId, path }: Props) => {
  const document = await cmsClient
    .collection(contentType)
    .findOne(documentId, query);

  return (
    <>
      <PageContext
        page_type={PAGE_TYPES[document.data.slug ?? ""] ?? "overview"}
        content_id={document.data.documentId}
        content_name={document.data.title ?? undefined}
      />
      <JsonLd
        data={collectionPageSchema(path, {
          name: document.data.title,
          description: document.data.description,
        })}
      />
      <OverviewPageTemplate document={document.data} />
    </>
  );
};

export { OverviewPage };

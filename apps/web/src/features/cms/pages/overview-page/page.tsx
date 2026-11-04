import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { JsonLd } from "@/components/content/json-ld";
import { PageContext } from "@/features/analytics";
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
        page_type={
          document.data.slug === "marketplace" ? "marketplace" : "overview"
        }
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

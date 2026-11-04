import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { PageContext } from "@/features/analytics";
import { cmsClient } from "@/features/cms/lib/strapi";
import { HelpPageTemplate } from "./template";

const contentType = "api::help-page.help-page" satisfies UID.ContentType;

const query = {
  populate: {
    image: true,
    sections: {
      populate: "*",
    },
    children: {
      populate: {
        url_alias: true,
      },
    },
    url_alias: true,
    parent: {
      populate: {
        parent: {
          populate: {
            url_alias: true,
          },
        },
        url_alias: true,
      },
    },
  },
} satisfies GetQueryParams<typeof contentType>;

export type HelpPageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

type Props = {
  documentId: string;
};

const HelpPagePage = async ({ documentId }: Props) => {
  const document = await cmsClient
    .collection(contentType)
    .findOne(documentId, query);

  return (
    <>
      <PageContext
        page_type="help_page"
        content_id={document.data.documentId}
        content_name={document.data.title ?? undefined}
      />
      <HelpPageTemplate document={document.data} />
    </>
  );
};

export { HelpPagePage };

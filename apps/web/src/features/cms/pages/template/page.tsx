import type {
  DocumentResponseCollection,
  GetQueryParams,
} from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { cmsClient } from "@/features/cms/lib/strapi";
import { TemplateTemplate } from "@/features/cms/pages/template";
import type { Owner } from "@/utils/types";

const contentType = "api::template.template" satisfies UID.ContentType;

const query = {
  populate: {
    preview_image: true,
    labels: true,
    categories: true,
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
  const document = await cmsClient
    .collection(contentType)
    .findOne(documentId, query);

  const owner: DocumentResponseCollection<Owner> = await cmsClient
    .fetch(
      `/owner?contentType=${contentType}&documentId=${documentId}&populate=*`,
    )
    .then((response) => response.json());

  return <TemplateTemplate document={document.data} owner={owner.data[0]!} />;
};

export { TemplatePage };

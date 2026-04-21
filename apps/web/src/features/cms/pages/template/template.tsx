import { StrapiFooter, StrapiNavbar } from "@repo/strapi-ui";
import { Navigation } from "@/components/layout/navigation";
import type { TemplatePageData } from "@/features/cms/pages/template";

type Props = {
  document: TemplatePageData;
};

const TemplateTemplate = ({ document }: Props) => {
  return (
    <div>
      <StrapiNavbar />
      <Navigation theme="dark" />
      Template {document.name}
      <StrapiFooter />
    </div>
  );
};

export { TemplateTemplate };

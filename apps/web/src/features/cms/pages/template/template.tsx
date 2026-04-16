import { Navigation } from "@/components/layout/navigation";
import type { TemplatePageData } from "@/features/cms/pages/template";

type Props = {
  document: TemplatePageData;
};

const TemplateTemplate = ({ document }: Props) => {
  return (
    <div>
      <Navigation theme="dark" />
      Template {document.name}
    </div>
  );
};

export { TemplateTemplate };

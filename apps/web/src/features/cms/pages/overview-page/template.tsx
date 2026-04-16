import { Navigation } from "@/components/layout/navigation";
import type { OverviewPageData } from "@/features/cms/pages/overview-page";
import { SectionsMapper } from "@/features/cms/sections/mapper";

type Props = {
  document: OverviewPageData;
};

const OverviewPageTemplate = ({ document }: Props) => {
  return (
    <div>
      <Navigation theme="dark" />
      {document.sections?.map((section) => {
        return (
          <SectionsMapper
            key={section.id}
            section={section}
            id={section.__component}
          />
        );
      })}
    </div>
  );
};

export { OverviewPageTemplate };

import type { Data, UID } from "@strapi/types";
import { CardGridSection } from "@/features/cms/sections/card-grid";
import { CTASection } from "@/features/cms/sections/cta";
import { HighlightsSection } from "@/features/cms/sections/highlights";
import { SearchSection } from "@/features/cms/sections/search";

type Props = {
  section: Data.Component;
  id: UID.Component;
};

/**
 * Map a CMS section to a React component.
 */
const SectionsMapper = ({ section, id }: Props) => {
  switch (id) {
    case "sections.card-grid":
      return <CardGridSection section={section} />;
    case "sections.search":
      return <SearchSection section={section} />;
    case "sections.highlights":
      return <HighlightsSection section={section} />;
    case "sections.cta":
      return <CTASection section={section} />;
    default:
      return null;
  }
};

export { SectionsMapper };

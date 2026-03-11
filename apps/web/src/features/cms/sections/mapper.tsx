import type { Data, UID } from "@strapi/types";
import CardGridSection from "@/features/cms/sections/CardGrid";
import CTASection from "@/features/cms/sections/CTA";
import HighlightsSection from "@/features/cms/sections/Highlights";
import SearchSection from "@/features/cms/sections/Search";

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

export default SectionsMapper;

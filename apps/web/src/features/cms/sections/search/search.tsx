import type { Data } from "@strapi/types";
import { Container } from "@/components/layout/container";
import { IntegrationsSearch } from "@/features/search/indexes/integrations";
import { MarketplaceSearch } from "@/features/search/indexes/marketplace/marketplace";
import { MembersSearch } from "@/features/search/indexes/members/members";
import { PartnersSearch } from "@/features/search/indexes/partners/partners";
import { ShowcasesSearch } from "@/features/search/indexes/showcases/showcases";

type Props = {
  section: Data.Component<"sections.search">;
};

const SearchIndex = ({ section }: Props) => {
  const { index_name } = section;

  switch (index_name) {
    case "marketplace":
      return <MarketplaceSearch />;
    case "partners":
      return <PartnersSearch />;
    case "members":
      return <MembersSearch />;
    case "integrations":
      return <IntegrationsSearch />;
    case "showcases":
      return <ShowcasesSearch />;
    default:
      return <div>No index found with name {index_name}</div>;
  }
};

const SearchSection = ({ section }: Props) => {
  return (
    <Container className="py-16">
      <SearchIndex section={section} />
    </Container>
  );
};

export { SearchSection };

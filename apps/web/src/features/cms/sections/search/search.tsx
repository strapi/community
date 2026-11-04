import { Container } from "@repo/strapi-ui";
import type { Data } from "@strapi/types";
import { HelpPagesSearch } from "@/features/search/indexes/help-pages";
import { IntegrationsSearch } from "@/features/search/indexes/integrations";
import { MarketplaceSearch } from "@/features/search/indexes/marketplace/marketplace";
import { MembersSearch } from "@/features/search/indexes/members/members";
import { PartnersSearch } from "@/features/search/indexes/partners/partners";
import { ShowcasesSearch } from "@/features/search/indexes/showcases/showcases";
import { SEARCH_INDEXES } from "@/features/search/lib/indexes";
import { getSearchServerState } from "@/features/search/lib/server-state";

type Props = {
  section: Data.Component<"sections.search">;
};

const SearchIndex = async ({ section }: Props) => {
  const { index_name } = section;

  switch (index_name) {
    case "marketplace": {
      const [packages, templates] = await Promise.all([
        getSearchServerState(SEARCH_INDEXES.packages),
        getSearchServerState(SEARCH_INDEXES.templates),
      ]);
      return (
        <MarketplaceSearch
          packagesServerState={packages}
          templatesServerState={templates}
        />
      );
    }
    case "partners":
      return (
        <PartnersSearch
          serverState={await getSearchServerState(SEARCH_INDEXES.partners)}
        />
      );
    case "members":
      return (
        <MembersSearch
          serverState={await getSearchServerState(SEARCH_INDEXES.members)}
        />
      );
    case "integrations":
      return (
        <IntegrationsSearch
          serverState={await getSearchServerState(SEARCH_INDEXES.integrations)}
        />
      );
    case "showcases":
      return (
        <ShowcasesSearch
          serverState={await getSearchServerState(SEARCH_INDEXES.showcases)}
        />
      );
    case "help_pages":
      return (
        <HelpPagesSearch
          serverState={await getSearchServerState(SEARCH_INDEXES.helpPages)}
        />
      );
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

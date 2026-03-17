import type { Data } from "@strapi/types";
import { Container } from "@/components/layout/container";
import { GenericSearch } from "@/features/search/indexes/generic-search";

type Props = {
  section: Data.Component<"sections.search">;
};

const SearchIndex = ({ section }: Props) => {
  const { index_name } = section;

  switch (index_name) {
    case "generic_search":
      return <GenericSearch />;
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

import type { Data } from "@strapi/types";

type Props = {
  section: Data.Component<"sections.search">;
};

const SearchSection = ({ section }: Props) => {
  const { index_name } = section;
  return <div>{index_name}</div>;
};

export default SearchSection;

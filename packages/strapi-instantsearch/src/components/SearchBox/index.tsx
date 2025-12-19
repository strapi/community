import { Searchbar, SearchForm } from "@strapi/design-system";
import { type UseSearchBoxProps, useSearchBox } from "react-instantsearch";

const SearchBox = (props: UseSearchBoxProps) => {
  const { query, refine, clear } = useSearchBox(props);

  return (
    <SearchForm>
      <Searchbar
        name="searchbar"
        size="M"
        onClear={() => clear()}
        value={query}
        onChange={(e) => refine(e.target.value)}
        clearLabel="Clear the search input"
      >
        Searching...
      </Searchbar>
    </SearchForm>
  );
};

export default SearchBox;

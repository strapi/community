"use client";

import type { InstantSearchServerState } from "react-instantsearch";
import { SearchIndex } from "@/features/search/components/search-index";
import { SEARCH_INDEXES } from "@/features/search/lib/indexes";
import { Hit } from "./components";

const HelpPagesSearch = ({
  serverState,
}: {
  serverState?: InstantSearchServerState;
}) => (
  <SearchIndex
    indexName={SEARCH_INDEXES.helpPages.indexName}
    serverState={serverState}
  >
    <SearchIndex.Content fullWidth>
      <SearchIndex.Hits hitComponent={Hit} />
      <SearchIndex.Configure hitsPerPage={24} />
    </SearchIndex.Content>
  </SearchIndex>
);

export { HelpPagesSearch };

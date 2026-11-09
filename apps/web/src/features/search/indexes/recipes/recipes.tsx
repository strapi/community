"use client";

import type { InstantSearchServerState } from "react-instantsearch";
import { SearchIndex } from "@/features/search/components/search-index";
import { SEARCH_INDEXES } from "@/features/search/lib/indexes";
import { Hit } from "./components";

const RecipesSearch = ({
  serverState,
}: {
  serverState?: InstantSearchServerState;
}) => (
  <SearchIndex
    indexName={SEARCH_INDEXES.recipes.indexName}
    serverState={serverState}
  >
    <SearchIndex.Layout>
      <SearchIndex.Sidebar />
      <SearchIndex.Content>
        <SearchIndex.SearchBox />
        <SearchIndex.Toolbar>
          <SearchIndex.Stats />
        </SearchIndex.Toolbar>
        <SearchIndex.Hits hitComponent={Hit} />
        <SearchIndex.Configure hitsPerPage={24} />
      </SearchIndex.Content>
    </SearchIndex.Layout>
  </SearchIndex>
);

export { RecipesSearch };

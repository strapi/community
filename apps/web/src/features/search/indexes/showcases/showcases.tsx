"use client";

import type { InstantSearchServerState } from "react-instantsearch";
import { RefinementList } from "@/features/search/components/refinement-list";
import { SearchIndex } from "@/features/search/components/search-index";
import { SEARCH_INDEXES } from "@/features/search/lib/indexes";
import { Hit } from "./components";

const idx = process.env.NEXT_PUBLIC_MEILISEARCH_SHOWCASES_INDEX_NAME!;

const ShowcasesSearch = ({
  serverState,
}: {
  serverState?: InstantSearchServerState;
}) => (
  <SearchIndex
    indexName={SEARCH_INDEXES.showcases.indexName}
    serverState={serverState}
  >
    <SearchIndex.Layout>
      <SearchIndex.Sidebar>
        <SearchIndex.FilterGroup label="Categories">
          <RefinementList attribute="categories.name" />
        </SearchIndex.FilterGroup>
      </SearchIndex.Sidebar>
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

export { ShowcasesSearch };

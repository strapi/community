"use client";

import type { InstantSearchServerState } from "react-instantsearch";
import { RefinementList } from "@/features/search/components/refinement-list";
import { SearchIndex } from "@/features/search/components/search-index";
import { SEARCH_INDEXES } from "@/features/search/lib/indexes";
import { Hit } from "./components";

const idx = process.env.NEXT_PUBLIC_MEILISEARCH_PARTNERS_INDEX_NAME!;

const PartnersSearch = ({
  serverState,
}: {
  serverState?: InstantSearchServerState;
}) => (
  <SearchIndex
    indexName={SEARCH_INDEXES.partners.indexName}
    serverState={serverState}
  >
    <SearchIndex.Layout>
      <SearchIndex.Sidebar>
        <SearchIndex.FilterGroup label="Type">
          <RefinementList
            sortBy={["count", "name"]}
            attribute="partner_level"
          />
        </SearchIndex.FilterGroup>
        <SearchIndex.FilterGroup label="Services">
          <RefinementList
            sortBy={["count", "name"]}
            attribute="profile.services.name"
          />
        </SearchIndex.FilterGroup>
        <SearchIndex.FilterGroup label="Countries">
          <RefinementList
            sortBy={["count", "name"]}
            attribute="profile.countries.name"
          />
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

export { PartnersSearch };

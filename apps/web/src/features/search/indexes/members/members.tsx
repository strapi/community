"use client";

import type { InstantSearchServerState } from "react-instantsearch";
import { SearchIndex } from "@/features/search/components/search-index";
import { ToggleRefinement } from "@/features/search/components/toggle-refinement";
import { SEARCH_INDEXES } from "@/features/search/lib/indexes";
import { Hit } from "./components";

const idx = process.env.NEXT_PUBLIC_MEILISEARCH_MEMBERS_INDEX_NAME!;

const MembersSearch = ({
  serverState,
}: {
  serverState?: InstantSearchServerState;
}) => (
  <SearchIndex
    indexName={SEARCH_INDEXES.members.indexName}
    serverState={serverState}
  >
    <SearchIndex.Layout>
      <SearchIndex.Sidebar>
        <SearchIndex.FilterGroup label="Highlighted">
          <ToggleRefinement
            attribute="community_star"
            label="Community Stars"
          />
        </SearchIndex.FilterGroup>
      </SearchIndex.Sidebar>
      <SearchIndex.Content>
        <SearchIndex.SearchBox />
        <SearchIndex.Toolbar>
          <SearchIndex.Stats />
          <SearchIndex.SortBy
            items={[
              {
                value: `${idx}:createdAt:desc`,
                label: "Newest",
              },
              {
                value: `${idx}:community_star:desc`,
                label: "Sort by: Community Stars",
              },
            ]}
          />
        </SearchIndex.Toolbar>
        <SearchIndex.Hits hitComponent={Hit} />
        <SearchIndex.Configure hitsPerPage={24} />
      </SearchIndex.Content>
    </SearchIndex.Layout>
  </SearchIndex>
);

export { MembersSearch };

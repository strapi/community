"use client";

import type { InstantSearchServerState } from "react-instantsearch";
import { RefinementList } from "@/features/search/components/refinement-list";
import { SearchIndex } from "@/features/search/components/search-index";
import { ToggleRefinement } from "@/features/search/components/toggle-refinement/toggle-refinement";
import {
  SEARCH_INDEXES,
  categoryFilter as toCategoryFilter,
} from "@/features/search/lib/indexes";
import { Hit } from "./components";

interface PackagesSearchProps {
  serverState?: InstantSearchServerState;
  categoryFilter?: string;
  showFilters?: boolean;
}

const idx = process.env.NEXT_PUBLIC_MEILISEARCH_PACKAGES_INDEX_NAME!;

const PackagesSearch = ({
  categoryFilter,
  serverState,
  showFilters = true,
}: PackagesSearchProps) => (
  <SearchIndex
    indexName={SEARCH_INDEXES.packages.indexName}
    serverState={serverState}
  >
    <SearchIndex.Layout>
      {showFilters && (
        <SearchIndex.Sidebar>
          <SearchIndex.FilterGroup label="Type">
            <RefinementList sortBy={["count"]} attribute="type" />
          </SearchIndex.FilterGroup>
          <SearchIndex.FilterGroup label="Categories">
            <RefinementList sortBy={["count"]} attribute="categories.name" />
          </SearchIndex.FilterGroup>
          <SearchIndex.FilterGroup label="Integrations">
            <RefinementList sortBy={["count"]} attribute="integrations.name" />
          </SearchIndex.FilterGroup>
        </SearchIndex.Sidebar>
      )}
      <SearchIndex.Content fullWidth={!showFilters}>
        <SearchIndex.SearchBox />
        <SearchIndex.Toolbar>
          <SearchIndex.Stats />
          <SearchIndex.SortBy
            items={[
              {
                value: `${idx}:monthly_downloads:desc`,
                label: "Sort by: Popular",
              },
              { value: `${idx}:stars:desc`, label: "Sort by: Github stars" },
              { value: `${idx}:createdAt:desc`, label: "Sort by: Newest" },
            ]}
          />
        </SearchIndex.Toolbar>
        <SearchIndex.Hits hitComponent={Hit} />
        <SearchIndex.Configure
          hitsPerPage={24}
          {...(categoryFilter && { filters: toCategoryFilter(categoryFilter) })}
        />
      </SearchIndex.Content>
    </SearchIndex.Layout>
  </SearchIndex>
);

export { PackagesSearch };

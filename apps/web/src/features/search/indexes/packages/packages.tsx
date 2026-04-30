"use client";

import { RefinementList } from "@/features/search/components/refinement-list";
import { SearchIndex } from "@/features/search/components/search-index";
import { ToggleRefinement } from "@/features/search/components/toggle-refinement/toggle-refinement";
import { Hit } from "./components";

interface PackagesSearchProps {
  categoryFilter?: string;
  showFilters?: boolean;
}

const idx = process.env.NEXT_PUBLIC_MEILISEARCH_PACKAGES_INDEX_NAME!;

const PackagesSearch = ({
  categoryFilter,
  showFilters = true,
}: PackagesSearchProps) => (
  <SearchIndex
    indexName={`${idx}:monthly_downloads:desc`}
    useNextSearch={false}
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
          {...(categoryFilter
            ? { filters: `categories.name = "${categoryFilter}"` }
            : {})}
        />
      </SearchIndex.Content>
    </SearchIndex.Layout>
  </SearchIndex>
);

export { PackagesSearch };

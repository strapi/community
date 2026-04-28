"use client";

import { RefinementList } from "@/features/search/components/refinement-list";
import { SearchIndex } from "@/features/search/components/search-index";
import { ToggleRefinement } from "@/features/search/components/toggle-refinement/toggle-refinement";
import { Hit } from "./components";

const PackagesSearch = () => (
  <SearchIndex
    indexName="packages:monthly_downloads:desc"
    useNextSearch={false}
  >
    <SearchIndex.Layout>
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
      <SearchIndex.Content>
        <SearchIndex.SearchBox />
        <SearchIndex.Toolbar>
          <SearchIndex.Stats />
          <SearchIndex.SortBy
            items={[
              {
                value: "packages:monthly_downloads:desc",
                label: "Sort by: Popular",
              },
              { value: "packages:stars:desc", label: "Sort by: Github stars" },
              { value: "packages:createdAt:desc", label: "Sort by: Newest" },
            ]}
          />
        </SearchIndex.Toolbar>
        <SearchIndex.Hits hitComponent={Hit} />
        <SearchIndex.Configure hitsPerPage={24} />
      </SearchIndex.Content>
    </SearchIndex.Layout>
  </SearchIndex>
);

export { PackagesSearch };

"use client";

import { RefinementList } from "@/features/search/components/refinement-list";
import { SearchIndex } from "@/features/search/components/search-index";
import { ToggleRefinement } from "@/features/search/components/toggle-refinement";
import { Hit } from "./components";

const GenericSearch = () => (
  <SearchIndex indexName="generic_search:monthly_downloads:desc">
    <SearchIndex.Layout>
      <SearchIndex.Sidebar>
        <SearchIndex.FilterGroup label="Application">
          <RefinementList attribute="type" />
        </SearchIndex.FilterGroup>
        <SearchIndex.FilterGroup label="Pricing">
          <ToggleRefinement attribute="labels.paid" label="Free" on={false} />
          <ToggleRefinement attribute="labels.paid" label="Paid" />
        </SearchIndex.FilterGroup>
        <SearchIndex.FilterGroup label="Categories">
          <RefinementList attribute="categories.name" />
        </SearchIndex.FilterGroup>
      </SearchIndex.Sidebar>
      <SearchIndex.Content>
        <SearchIndex.SearchBox />
        <SearchIndex.Toolbar>
          <SearchIndex.Stats />
          <SearchIndex.SortBy
            items={[
              {
                value: "generic_search:monthly_downloads:desc",
                label: "Sort by: Popular",
              },
              {
                value: "generic_search:stars:desc",
                label: "Sort by: Github stars",
              },
              {
                value: "generic_search:createdAt:desc",
                label: "Sort by: Newest",
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

export { GenericSearch };

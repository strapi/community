"use client";

import { RefinementList } from "@/features/search/components/refinement-list";
import { SearchIndex } from "@/features/search/components/search-index";
import { ToggleRefinement } from "@/features/search/components/toggle-refinement";
import { Hit } from "./components";

const idx = process.env.NEXT_PUBLIC_MEILISEARCH_GENERIC_INDEX_NAME!;

const GenericSearch = () => (
  <SearchIndex indexName={`${idx}:monthly_downloads:desc`}>
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
                value: `${idx}:monthly_downloads:desc`,
                label: "Sort by: Popular",
              },
              {
                value: `${idx}:stars:desc`,
                label: "Sort by: Github stars",
              },
              {
                value: `${idx}:createdAt:desc`,
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

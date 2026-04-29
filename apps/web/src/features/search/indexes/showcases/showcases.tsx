"use client";

import { RefinementList } from "@/features/search/components/refinement-list";
import { SearchIndex } from "@/features/search/components/search-index";
import { Hit } from "./components";

const ShowcasesSearch = () => (
  <SearchIndex indexName="showcases:createdAt:desc">
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
          <SearchIndex.SortBy
            items={[
              {
                value: "showcases:createdAt:desc",
                label: "Sort by: Popular",
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

export { ShowcasesSearch };

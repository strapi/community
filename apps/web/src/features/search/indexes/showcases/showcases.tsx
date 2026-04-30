"use client";

import { RefinementList } from "@/features/search/components/refinement-list";
import { SearchIndex } from "@/features/search/components/search-index";
import { Hit } from "./components";

const idx = process.env.NEXT_PUBLIC_MEILISEARCH_SHOWCASES_INDEX_NAME!;

const ShowcasesSearch = () => (
  <SearchIndex indexName={`${idx}:createdAt:desc`}>
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
                value: `${idx}:createdAt:desc`,
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

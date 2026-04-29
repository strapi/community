"use client";

import { SearchIndex } from "@/features/search/components/search-index";
import { Hit } from "./components";

const RecipesSearch = () => (
  <SearchIndex indexName="recipes:createdAt:desc" useNextSearch={false}>
    <SearchIndex.Layout>
      <SearchIndex.Sidebar />
      <SearchIndex.Content>
        <SearchIndex.SearchBox />
        <SearchIndex.Toolbar>
          <SearchIndex.Stats />
          <SearchIndex.SortBy
            items={[
              { value: "recipes:createdAt:desc", label: "Sort by: Newest" },
            ]}
          />
        </SearchIndex.Toolbar>
        <SearchIndex.Hits hitComponent={Hit} />
        <SearchIndex.Configure hitsPerPage={24} />
      </SearchIndex.Content>
    </SearchIndex.Layout>
  </SearchIndex>
);

export { RecipesSearch };

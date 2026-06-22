"use client";

import { SearchIndex } from "@/features/search/components/search-index";
import { Hit } from "./components";

const idx = process.env.NEXT_PUBLIC_MEILISEARCH_RECIPES_INDEX_NAME!;

const RecipesSearch = () => (
  <SearchIndex indexName={`${idx}:createdAt:desc`} useNextSearch={false}>
    <SearchIndex.Layout>
      <SearchIndex.Sidebar />
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

export { RecipesSearch };

"use client";

import { SearchIndex } from "@/features/search/components/search-index";
import { Hit } from "./components";

const TemplatesSearch = () => (
  <SearchIndex indexName="templates:stars:desc" useNextSearch={false}>
    <SearchIndex.Layout>
      <SearchIndex.Sidebar />
      <SearchIndex.Content>
        <SearchIndex.SearchBox />
        <SearchIndex.Toolbar>
          <SearchIndex.Stats />
          <SearchIndex.SortBy
            items={[
              { value: "templates:stars:desc", label: "Sort by: Github stars" },
              { value: "templates:createdAt:desc", label: "Sort by: Newest" },
            ]}
          />
        </SearchIndex.Toolbar>
        <SearchIndex.Hits hitComponent={Hit} />
        <SearchIndex.Configure hitsPerPage={24} />
      </SearchIndex.Content>
    </SearchIndex.Layout>
  </SearchIndex>
);

export { TemplatesSearch };

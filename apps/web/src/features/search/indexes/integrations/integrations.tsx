"use client";

import { RefinementList } from "@/features/search/components/refinement-list";
import { SearchIndex } from "@/features/search/components/search-index";
import { Hit } from "./components";

const idx = process.env.NEXT_PUBLIC_MEILISEARCH_INTEGRATIONS_INDEX_NAME!;

const IntegrationsSearch = () => (
  <SearchIndex indexName={`${idx}:labels.featured:desc`}>
    <SearchIndex.Layout>
      <SearchIndex.Sidebar>
        <SearchIndex.FilterGroup label="Categories">
          <RefinementList
            sortBy={["count", "name"]}
            attribute="categories.name"
          />
        </SearchIndex.FilterGroup>
      </SearchIndex.Sidebar>
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

export { IntegrationsSearch };

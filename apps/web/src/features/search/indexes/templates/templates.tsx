"use client";

import { RefinementList } from "@/features/search/components/refinement-list/refinement-list";
import { SearchIndex } from "@/features/search/components/search-index";
import { Hit } from "./components";

interface TemplatesSearchProps {
  categoryFilter?: string;
  showFilters?: boolean;
}

const idx = process.env.NEXT_PUBLIC_MEILISEARCH_TEMPLATES_INDEX_NAME!;

const TemplatesSearch = ({
  categoryFilter,
  showFilters = true,
}: TemplatesSearchProps) => (
  <SearchIndex indexName={`${idx}:stars:desc`} useNextSearch={false}>
    <SearchIndex.Layout>
      {showFilters && (
        <SearchIndex.Sidebar>
          <SearchIndex.FilterGroup label="Categories">
            <RefinementList sortBy={["count"]} attribute="categories.name" />
          </SearchIndex.FilterGroup>
          <SearchIndex.FilterGroup label="Integrations">
            <RefinementList sortBy={["count"]} attribute="integrations.name" />
          </SearchIndex.FilterGroup>
        </SearchIndex.Sidebar>
      )}
      <SearchIndex.Content>
        <SearchIndex.SearchBox />
        <SearchIndex.Toolbar>
          <SearchIndex.Stats />
          <SearchIndex.SortBy
            items={[
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

export { TemplatesSearch };

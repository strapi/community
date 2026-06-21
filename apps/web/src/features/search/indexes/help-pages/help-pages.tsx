"use client";

import { SearchIndex } from "@/features/search/components/search-index";
import { Hit } from "./components";

const idx = process.env.NEXT_PUBLIC_MEILISEARCH_HELP_PAGES_INDEX_NAME!;

const HelpPagesSearch = () => (
  <SearchIndex indexName={`${idx}:createdAt:desc`} useNextSearch={false}>
    <SearchIndex.Content fullWidth>
      <SearchIndex.Hits hitComponent={Hit} />
      <SearchIndex.Configure hitsPerPage={24} />
    </SearchIndex.Content>
  </SearchIndex>
);

export { HelpPagesSearch };

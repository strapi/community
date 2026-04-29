"use client";

import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Configure, InstantSearch } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { GridHits } from "@/features/search/components/grid-hits";
import { SearchBox } from "@/features/search/components/search-box";
import { SortBy } from "@/features/search/components/sort-by";
import { Stats } from "@/features/search/components/stats";

const { searchClient } = instantMeiliSearch(
  process.env.NEXT_PUBLIC_SEARCH_URL as string,
  process.env.NEXT_PUBLIC_SEARCH_API_KEY as string,
  { keepZeroFacets: true },
);

// Root

interface SearchIndexRootProps {
  indexName: string;
  useNextSearch?: boolean;
  children: ReactNode;
}

const SearchIndexRoot = ({
  indexName,
  useNextSearch = true,
  children,
}: SearchIndexRootProps) => {
  if (useNextSearch) {
    return (
      <InstantSearchNext
        routing
        indexName={indexName}
        searchClient={searchClient}
      >
        {children}
      </InstantSearchNext>
    );
  }

  return (
    <InstantSearch routing indexName={indexName} searchClient={searchClient}>
      {children}
    </InstantSearch>
  );
};

// Layout

const SearchIndexLayout = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">{children}</div>
);

// Sidebar

const SearchIndexSidebar = ({ children }: { children?: ReactNode }) => (
  <aside className="lg:col-span-3 sticky top-25">
    {children && (
      <div className="flex w-full flex-col items-start gap-8">{children}</div>
    )}
  </aside>
);

// FilterGroup

interface SearchIndexFilterGroupProps {
  label: string;
  children: ReactNode;
}

const SearchIndexFilterGroup = ({
  label,
  children,
}: SearchIndexFilterGroupProps) => (
  <div className="flex w-full flex-col items-start gap-4">
    <h3 className="text-xs font-semibold tracking-[0.22em] text-(--color-primary600) uppercase">
      {label}
    </h3>
    <div className="flex w-full flex-col items-start gap-2">{children}</div>
  </div>
);

// Content

const SearchIndexContent = ({
  children,
  fullWidth,
}: {
  children: ReactNode;
  fullWidth?: boolean;
}) => (
  <section className={fullWidth ? "lg:col-span-12" : "lg:col-span-9"}>
    {children}
  </section>
);

// SearchBox

const SearchIndexSearchBox = () => (
  <div className="mb-6">
    <SearchBox />
  </div>
);

// Toolbar

const SearchIndexToolbar = ({ children }: { children: ReactNode }) => (
  <div className="mb-6 flex w-full items-center">{children}</div>
);

// Stats

const SearchIndexStats = () => <Stats />;

// SortBy

interface SortItem {
  value: string;
  label: string;
}

const SearchIndexSortBy = ({ items }: { items: SortItem[] }) => (
  <div className="ml-auto">
    <SortBy items={items} />
  </div>
);

// Hits

interface SearchIndexHitsProps {
  hitComponent: React.ComponentType<{ hit: any }>;
}

const SearchIndexHits = ({ hitComponent }: SearchIndexHitsProps) => (
  <GridHits hitComponent={hitComponent} />
);

// Configure

const SearchIndexConfigure = (
  props: ComponentPropsWithoutRef<typeof Configure>,
) => <Configure {...props} />;

// Compound component

const SearchIndex = Object.assign(SearchIndexRoot, {
  Layout: SearchIndexLayout,
  Sidebar: SearchIndexSidebar,
  FilterGroup: SearchIndexFilterGroup,
  Content: SearchIndexContent,
  SearchBox: SearchIndexSearchBox,
  Toolbar: SearchIndexToolbar,
  Stats: SearchIndexStats,
  SortBy: SearchIndexSortBy,
  Hits: SearchIndexHits,
  Configure: SearchIndexConfigure,
});

export { SearchIndex };

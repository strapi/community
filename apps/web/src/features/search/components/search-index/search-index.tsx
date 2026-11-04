"use client";

import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { history } from "instantsearch.js/es/lib/routers";
import { SlidersHorizontal, X } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  Configure,
  InstantSearch,
  type InstantSearchServerState,
  InstantSearchSSRProvider,
  useInstantSearch,
} from "react-instantsearch";
import { GridHits } from "@/features/search/components/grid-hits";
import { SearchBox } from "@/features/search/components/search-box";
import { SortBy } from "@/features/search/components/sort-by";
import { Stats } from "@/features/search/components/stats";
import { cn } from "@/lib/utils";

const { searchClient } = instantMeiliSearch(
  process.env.NEXT_PUBLIC_SEARCH_URL as string,
  process.env.NEXT_PUBLIC_SEARCH_API_KEY as string,
  { keepZeroFacets: true },
);

// Context

interface SearchIndexContextValue {
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: (open: boolean) => void;
  hasFilters: boolean;
  setHasFilters: (has: boolean) => void;
}

const SearchIndexContext = createContext<SearchIndexContextValue>({
  isFilterModalOpen: false,
  setIsFilterModalOpen: () => {},
  hasFilters: false,
  setHasFilters: () => {},
});

// Root

interface SearchIndexRootProps {
  indexName: string;
  /**
   * The default first page of results, fetched on the server (see
   * getSearchServerState) so it's part of the server-rendered HTML.
   */
  serverState?: InstantSearchServerState;
  children: ReactNode;
}

const SearchIndexRoot = ({
  indexName,
  serverState,
  children,
}: SearchIndexRootProps) => {
  const pathname = usePathname();

  // Strip `page` from the URL so that "load more" doesn't pollute the URL.
  // Filters (query, refinementList, sortBy, etc.) are still persisted — this
  // is what makes them sticky across refreshes and shared links.
  const routing = useMemo(
    () => ({
      router: history<Record<string, unknown>>({
        // The server render (with initial results) has no window; it always
        // renders the default state, which is what the page is cached as.
        getLocation: () =>
          typeof window === "undefined"
            ? (new URL(pathname, "http://localhost") as unknown as Location)
            : window.location,
      }),
      stateMapping: {
        stateToRoute(uiState: Record<string, Record<string, unknown>>) {
          const { page: _page, ...rest } = uiState[indexName] ?? {};
          return rest;
        },
        routeToState(routeState: Record<string, unknown>) {
          return { [indexName]: routeState };
        },
      },
    }),
    [indexName, pathname],
  );

  const search = (
    <InstantSearch
      routing={routing}
      indexName={indexName}
      searchClient={searchClient}
    >
      {serverState && <RefreshAfterHydration />}
      {children}
    </InstantSearch>
  );

  return serverState ? (
    <InstantSearchSSRProvider {...serverState}>
      {search}
    </InstantSearchSSRProvider>
  ) : (
    search
  );
};

/**
 * Server-rendered results are the default state, while the URL may carry a
 * query or filters (e.g. /marketplace?query=seo). Hydrate with the server
 * results, then search with the real state.
 */
const RefreshAfterHydration = () => {
  const { refresh } = useInstantSearch();

  useEffect(() => {
    refresh();
  }, [refresh]);

  return null;
};

// Layout

const SearchIndexLayout = ({ children }: { children: ReactNode }) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [hasFilters, setHasFilters] = useState(false);

  useEffect(() => {
    if (isFilterModalOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterModalOpen]);

  return (
    <SearchIndexContext.Provider
      value={{
        isFilterModalOpen,
        setIsFilterModalOpen,
        hasFilters,
        setHasFilters,
      }}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">{children}</div>
    </SearchIndexContext.Provider>
  );
};

// Sidebar

const SearchIndexSidebar = ({ children }: { children?: ReactNode }) => {
  const { isFilterModalOpen, setIsFilterModalOpen, setHasFilters } =
    useContext(SearchIndexContext);

  useEffect(() => {
    setHasFilters(true);
    return () => setHasFilters(false);
  }, [setHasFilters]);

  if (!children) return null;

  return (
    <aside
      className={cn(
        "lg:col-span-3 lg:sticky lg:top-25 lg:self-start",
        isFilterModalOpen
          ? "fixed inset-0 z-50 flex flex-col overflow-hidden bg-white lg:inset-auto lg:z-auto lg:block lg:overflow-visible lg:bg-transparent"
          : "hidden lg:block",
      )}
    >
      {/* Mobile-only header */}
      <div className="flex shrink-0 items-center justify-between border-b border-(--color-neutral200) px-6 py-4 lg:hidden">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button
          type="button"
          onClick={() => setIsFilterModalOpen(false)}
          className="rounded-md p-1 text-(--color-neutral600) hover:bg-(--color-neutral100)"
          aria-label="Close filters"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Filter content */}
      <div
        className={cn(
          "flex w-full flex-col items-start gap-8",
          isFilterModalOpen && "flex-1 overflow-y-auto px-6 py-6",
        )}
      >
        {children}
      </div>

      {/* Mobile-only footer */}
      <div className="shrink-0 border-t border-(--color-neutral200) px-6 py-4 lg:hidden">
        <button
          type="button"
          onClick={() => setIsFilterModalOpen(false)}
          className="w-full rounded-lg bg-(--color-primary600) px-4 py-3 text-base font-medium text-white"
        >
          View results
        </button>
      </div>
    </aside>
  );
};

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

const SearchIndexToolbar = ({ children }: { children: ReactNode }) => {
  const { hasFilters, setIsFilterModalOpen } = useContext(SearchIndexContext);

  return (
    <div className="mb-6 flex w-full flex-wrap items-center gap-2">
      {hasFilters && (
        <button
          type="button"
          onClick={() => setIsFilterModalOpen(true)}
          className="lg:hidden inline-flex items-center gap-2 rounded-lg border border-(--color-neutral300) bg-white px-3 py-2 text-sm font-medium text-(--color-neutral700)"
          aria-label="Open filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      )}
      {children}
    </div>
  );
};

// Stats

const SearchIndexStats = () => <Stats />;

// SortBy

interface SortItem {
  value: string;
  label: string;
}

const SearchIndexSortBy = ({ items }: { items: SortItem[] }) => (
  <div className="w-full lg:ml-auto lg:w-auto">
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

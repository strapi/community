"use client";

import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { Configure, InstantSearch } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { GridHits } from "@/features/search/components/grid-hits";
import { Hit } from "@/features/search/components/hit";
import { RefinementList } from "@/features/search/components/refinement-list";
import { SearchBox } from "@/features/search/components/search-box";
import { SortBy } from "@/features/search/components/sort-by";
import { Stats } from "@/features/search/components/stats";
import { ToggleRefinement } from "@/features/search/components/toggle-refinement";

const { searchClient } = instantMeiliSearch(
  process.env.NEXT_PUBLIC_SEARCH_URL as string,
  process.env.NEXT_PUBLIC_SEARCH_API_KEY as string,
  {
    keepZeroFacets: true,
  },
);

const RecipesSearch = () => (
  <InstantSearch indexName="recipes:createdAt:desc" searchClient={searchClient}>
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <aside className="lg:col-span-3 sticky top-25"></aside>
      <section className="lg:col-span-9">
        <div className="mb-6">
          <SearchBox />
        </div>
        <div className="mb-6 flex w-full items-center">
          <Stats />
          <div className="ml-auto">
            <SortBy
              items={[
                {
                  value: "recipes:createdAt:desc",
                  label: "Sort by: Newest",
                },
              ]}
            />
          </div>
        </div>
        <GridHits hitComponent={Hit} />
        <Configure hitsPerPage={24} />
      </section>
    </div>
  </InstantSearch>
);

export { RecipesSearch };

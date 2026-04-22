"use client";

import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { Configure } from "react-instantsearch";
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

const ShowcasesSearch = () => (
  <InstantSearchNext
    indexName="showcases:monthly_downloads:desc"
    searchClient={searchClient}
  >
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <aside className="lg:col-span-3 sticky top-25">
        <div className="flex w-full flex-col items-start gap-8">
          <div className="flex w-full flex-col items-start gap-4">
            <h3 className="text-xs font-semibold tracking-[0.22em] text-(--color-primary600) uppercase">
              Application
            </h3>
            <div className="flex w-full flex-col items-start gap-2">
              <RefinementList attribute="type" />
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <h3 className="text-xs font-semibold tracking-[0.22em] text-(--color-primary600) uppercase">
              Pricing
            </h3>
            <div className="flex w-full flex-col items-start gap-2">
              <ToggleRefinement
                attribute="labels.paid"
                label="Free"
                on={false}
              />
              <ToggleRefinement attribute="labels.paid" label="Paid" />
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <h3 className="text-xs font-semibold tracking-[0.22em] text-(--color-primary600) uppercase">
              Categories
            </h3>
            <div className="flex w-full flex-col items-start gap-2">
              <RefinementList attribute="categories.name" />
            </div>
          </div>
        </div>
      </aside>
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
                  value: "showcases:monthly_downloads:desc",
                  label: "Sort by: Popular",
                },
                {
                  value: "showcases:stars:desc",
                  label: "Sort by: Github stars",
                },
                {
                  value: "showcases:createdAt:desc",
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
  </InstantSearchNext>
);

export { ShowcasesSearch };

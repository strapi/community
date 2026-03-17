import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { Configure, InstantSearch } from "react-instantsearch";
import GridHits from "@/features/search/components/GridHits";
import PackageCard from "@/features/search/components/PackageCard";
import RefinementList from "@/features/search/components/RefinementList";
import SearchBox from "@/features/search/components/SearchBox";
import SortBy from "@/features/search/components/SortBy";
import Stats from "@/features/search/components/Stats";
import ToggleRefinement from "@/features/search/components/ToggleRefinement";

const { searchClient } = instantMeiliSearch(
  process.env.NEXT_PUBLIC_SEARCH_URL as string,
  process.env.NEXT_PUBLIC_SEARCH_API_KEY as string,
  {
    keepZeroFacets: true,
  },
);

const GenericSearch = () => (
  <InstantSearch
    indexName="generic_search:npm_downloads:asc"
    searchClient={searchClient}
  >
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <div className="mb-6 max-w-70">
          <SearchBox />
        </div>
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
        <div className="mb-6 flex w-full items-center">
          <Stats />
          <div className="ml-auto">
            <SortBy
              items={[
                {
                  value: "generic_search:npm_downloads:desc",
                  label: "Sort by: Popular",
                },
                {
                  value: "generic_search:github_stars:desc",
                  label: "Sort by: Github stars",
                },
                {
                  value: "generic_search:createdAt:desc",
                  label: "Sort by: Newest",
                },
              ]}
            />
          </div>
        </div>
        <GridHits hitComponent={PackageCard} />
        <Configure hitsPerPage={24} />
      </section>
    </div>
  </InstantSearch>
);

export default GenericSearch;

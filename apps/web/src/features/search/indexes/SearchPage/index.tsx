import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import {
  RefinementList,
  SearchBox,
  SortBy,
  ToggleRefinement,
} from "@repo/strapi-instantsearch";
import { Configure, InstantSearch } from "react-instantsearch";
import GridHits from "@/features/search/components/GridHits";
import PackageCard from "@/features/search/components/PackageCard";
import Stats from "@/features/search/components/Stats";

const { searchClient } = instantMeiliSearch(
  process.env.NEXT_PUBLIC_SEARCH_URL as string,
  process.env.NEXT_PUBLIC_SEARCH_API_KEY as string,
  {
    keepZeroFacets: true,
  },
);

const SearchPage = () => (
  <InstantSearch
    indexName="search_page:npm_downloads:asc"
    searchClient={searchClient}
  >
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <h2 className="mb-4 text-2xl font-semibold text-(--color-neutral900)">
          Filters
        </h2>
        <div className="flex w-full flex-col items-start gap-6">
          <div className="flex w-full flex-col items-start gap-4">
            <h3 className="text-base font-semibold text-(--color-neutral800)">
              Type
            </h3>
            <div className="flex w-full flex-col items-start gap-2">
              <RefinementList attribute="type" />
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <h3 className="text-base font-semibold text-(--color-neutral800)">
              Categories
            </h3>
            <div className="flex w-full flex-col items-start gap-2">
              <RefinementList attribute="categories.name" />
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <h3 className="text-base font-semibold text-(--color-neutral800)">
              Labels
            </h3>
            <div className="flex w-full flex-col items-start gap-2">
              <ToggleRefinement attribute="labels.featured" label="Featured" />
              <ToggleRefinement attribute="labels.official" label="Official" />
              <ToggleRefinement attribute="labels.paid" label="Paid" />
            </div>
          </div>
        </div>
      </aside>
      <section className="lg:col-span-9">
        <div className="mb-6 w-full">
          <SearchBox />
        </div>
        <div className="mb-6 flex w-full items-center">
          <Stats />
          <div className="ml-auto">
            <SortBy
              items={[
                {
                  value: "search_page:npm_downloads:asc",
                  label: "NPM downloads",
                },
                {
                  value: "search_page:github_stars:desc",
                  label: "Github stars",
                },
                {
                  value: "search_page:createdAt:desc",
                  label: "Newest",
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

export default SearchPage;

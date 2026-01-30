import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import {
  RefinementList,
  SearchBox,
  SortBy,
  ToggleRefinement,
} from "@repo/strapi-instantsearch";
import { Box, Flex, Grid, Typography } from "@strapi/design-system";
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
    <Grid.Root gridCols={12}>
      <Grid.Item col={3} direction="column" alignItems="start">
        <Typography variant="beta" marginBottom={4}>
          Filters
        </Typography>
        <Flex direction="column" gap={6} width="100%" alignItems="start">
          <Flex direction="column" gap={4} width="100%" alignItems="start">
            <Typography variant="delta">Type</Typography>
            <Flex direction="column" gap={2} width="100%" alignItems="start">
              <RefinementList attribute="type" />
            </Flex>
          </Flex>
          <Flex direction="column" gap={4} width="100%" alignItems="start">
            <Typography variant="delta">Categories</Typography>
            <Flex direction="column" gap={2} width="100%" alignItems="start">
              <RefinementList attribute="categories.name" />
            </Flex>
          </Flex>
          <Flex direction="column" gap={4} width="100%" alignItems="start">
            <Typography variant="delta">Labels</Typography>
            <Flex direction="column" gap={2} width="100%" alignItems="start">
              <ToggleRefinement attribute="labels.featured" label="Featured" />
              <ToggleRefinement attribute="labels.official" label="Official" />
              <ToggleRefinement attribute="labels.paid" label="Paid" />
            </Flex>
          </Flex>
        </Flex>
      </Grid.Item>
      <Grid.Item col={9} direction="column" alignItems="start">
        <Box width="100%" marginBottom="24px">
          <SearchBox />
        </Box>
        <Flex width="100%" marginBottom="24px">
          <Stats />
          <Box marginLeft="auto">
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
          </Box>
        </Flex>
        <GridHits hitComponent={PackageCard} />
        <Configure hitsPerPage={24} />
      </Grid.Item>
    </Grid.Root>
  </InstantSearch>
);

export default SearchPage;

"use client";

import type { RefinementListProps } from "react-instantsearch";
import { CONTRIBUTOR_TIERS } from "@/features/github-contributions/lib/contributor-tiers";
import { RefinementList } from "@/features/search/components/refinement-list";
import { SearchIndex } from "@/features/search/components/search-index";
import { ToggleRefinement } from "@/features/search/components/toggle-refinement";
import { Hit } from "./components";

const idx = process.env.NEXT_PUBLIC_MEILISEARCH_MEMBERS_INDEX_NAME!;

/**
 * Shows contributor tiers by label, highest tier first. Module-level so the
 * reference is stable — InstantSearch re-renders on a new `transformItems`.
 */
const transformTierItems: RefinementListProps["transformItems"] = (items) =>
  [...CONTRIBUTOR_TIERS].reverse().flatMap((tier) => {
    const item = items.find(({ value }) => value === tier.key);
    return item ? [{ ...item, label: tier.label }] : [];
  });

const MembersSearch = () => (
  <SearchIndex indexName={`${idx}:createdAt:desc`}>
    <SearchIndex.Layout>
      <SearchIndex.Sidebar>
        <SearchIndex.FilterGroup label="Highlighted">
          <ToggleRefinement
            attribute="community_star"
            label="Community Stars"
          />
        </SearchIndex.FilterGroup>
        <SearchIndex.FilterGroup label="Contributor tier">
          <RefinementList
            attribute="contributor_tier"
            transformItems={transformTierItems}
          />
        </SearchIndex.FilterGroup>
      </SearchIndex.Sidebar>
      <SearchIndex.Content>
        <SearchIndex.SearchBox />
        <SearchIndex.Toolbar>
          <SearchIndex.Stats />
          <SearchIndex.SortBy
            items={[
              {
                value: `${idx}:createdAt:desc`,
                label: "Newest",
              },
              {
                value: `${idx}:community_star:desc`,
                label: "Sort by: Community Stars",
              },
              {
                value: `${idx}:contribution_score:desc`,
                label: "Sort by: Top Contributors",
              },
            ]}
          />
        </SearchIndex.Toolbar>
        <SearchIndex.Hits hitComponent={Hit} />
        <SearchIndex.Configure hitsPerPage={24} />
      </SearchIndex.Content>
    </SearchIndex.Layout>
  </SearchIndex>
);

export { MembersSearch };

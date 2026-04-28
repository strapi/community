"use client";

import { RefinementList } from "@/features/search/components/refinement-list";
import { SearchIndex } from "@/features/search/components/search-index";
import { Hit } from "./components";

const PartnersSearch = () => (
  <SearchIndex indexName="partners:partner_level_rank:asc">
    <SearchIndex.Layout>
      <SearchIndex.Sidebar>
        <SearchIndex.FilterGroup label="Type">
          <RefinementList
            sortBy={["count", "name"]}
            attribute="partner_level"
          />
        </SearchIndex.FilterGroup>
        <SearchIndex.FilterGroup label="Services">
          <RefinementList
            sortBy={["count", "name"]}
            attribute="profile.services.name"
          />
        </SearchIndex.FilterGroup>
        <SearchIndex.FilterGroup label="Countries">
          <RefinementList
            sortBy={["count", "name"]}
            attribute="profile.countries.name"
          />
        </SearchIndex.FilterGroup>
      </SearchIndex.Sidebar>
      <SearchIndex.Content>
        <SearchIndex.SearchBox />
        <SearchIndex.Toolbar>
          <SearchIndex.Stats />
        </SearchIndex.Toolbar>
        <SearchIndex.Hits hitComponent={Hit} />
        <SearchIndex.Configure hitsPerPage={24} />
      </SearchIndex.Content>
    </SearchIndex.Layout>
  </SearchIndex>
);

export { PartnersSearch };

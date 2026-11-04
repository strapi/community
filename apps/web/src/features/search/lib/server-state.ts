import "server-only";

import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import type { InstantSearchServerState } from "react-instantsearch";
import { HITS_PER_PAGE, type SearchIndexConfig } from "./indexes";

const { searchClient } = instantMeiliSearch(
  process.env.NEXT_PUBLIC_SEARCH_URL as string,
  process.env.NEXT_PUBLIC_SEARCH_API_KEY as string,
  { keepZeroFacets: true },
);

/**
 * Fetches the default (unfiltered, first page) results of a search UI so
 * they're part of the server-rendered, ISR-cached HTML, which is what
 * crawlers index. The client re-runs the search after hydrating to apply
 * whatever the URL asks for.
 *
 * Returns undefined when Meilisearch is unreachable; the UI then simply
 * searches client-side as before.
 */
export async function getSearchServerState(
  { indexName, facets }: SearchIndexConfig,
  filters?: string,
): Promise<InstantSearchServerState | undefined> {
  const params = {
    query: "",
    page: 0,
    hitsPerPage: HITS_PER_PAGE,
    facets,
    ...(filters && { filters }),
  };

  try {
    // biome-ignore lint/suspicious/noExplicitAny: the adapter's request type is a union that doesn't accept a plain multi-query
    const { results } = await searchClient.search([
      { indexName, params },
    ] as any);

    return {
      initialResults: {
        [indexName]: {
          state: {
            index: indexName,
            query: "",
            page: 0,
            hitsPerPage: HITS_PER_PAGE,
            disjunctiveFacets: facets,
            ...(filters && { filters }),
          },
          // biome-ignore lint/suspicious/noExplicitAny: Meilisearch's Algolia-compatible response
          results: results as any,
        },
      },
    };
  } catch {
    return undefined;
  }
}

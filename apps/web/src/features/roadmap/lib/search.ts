import type { UiState } from "instantsearch.js";
import { history } from "instantsearch.js/es/lib/routers";
import type { RouterProps } from "instantsearch.js/es/middlewares/createRouterMiddleware";
import { replaceUrlInPage } from "@/features/analytics";
import { SEARCH_INDEXES } from "@/features/search/lib/indexes";
import {
  parseRoadmapState,
  type RoadmapSort,
  type RoadmapState,
} from "./types";

const index = process.env.NEXT_PUBLIC_MEILISEARCH_ROADMAP_INDEX_NAME ?? "";
const { indexName } = SEARCH_INDEXES.roadmap;

/** Sort replicas, each tie-broken by title. */
export const ROADMAP_SORT_INDEXES: Record<RoadmapSort, string> = {
  votes: indexName,
  newest: `${index}:first_published_at:desc,public_title:asc`,
  release: `${index}:release_rank:desc,public_title:asc`,
  title: `${index}:public_title:asc`,
};

const sortKey = (sortBy?: string): RoadmapSort =>
  (Object.keys(ROADMAP_SORT_INDEXES) as RoadmapSort[]).find(
    (key) => ROADMAP_SORT_INDEXES[key] === sortBy,
  ) ?? "votes";

type RouteState = Partial<Omit<RoadmapState, "view">>;

/** The query params the search state owns; anything else passes through. */
const SEARCH_PARAMS = ["q", "sort", "release", "area"];

/**
 * Keeps the roadmap's own URL scheme (`?q=&sort=&release=&area=`) so shared
 * links keep working. `view` and `item` belong to the board, which writes
 * them itself, so they're carried over untouched. Updates replace the
 * history entry rather than pushing one per keystroke.
 */
export const roadmapRouting = (
  pathname: string,
): RouterProps<UiState, RouteState> => ({
  router: history<RouteState>({
    // The server render has no window; it renders the default state, which
    // is what the page is cached as.
    getLocation: () =>
      typeof window === "undefined"
        ? (new URL(pathname, "http://localhost") as unknown as Location)
        : window.location,
    parseURL: ({ location }) =>
      parseRoadmapState(new URLSearchParams(location.search)),
    createURL: ({ routeState, location }) => {
      const url = new URL(location.href);
      const params = new URLSearchParams();
      if (routeState.q) params.set("q", routeState.q);
      if (routeState.sort && routeState.sort !== "votes") {
        params.set("sort", routeState.sort);
      }
      for (const r of routeState.releases ?? []) params.append("release", r);
      for (const a of routeState.areas ?? []) params.append("area", a);
      for (const [key, value] of url.searchParams) {
        if (!SEARCH_PARAMS.includes(key)) params.append(key, value);
      }
      url.search = params.toString();
      return url.toString();
    },
    push: (url) => replaceUrlInPage(new URL(url)),
  }),
  stateMapping: {
    stateToRoute(uiState: UiState): RouteState {
      const state = uiState[indexName] ?? {};
      return {
        q: state.query ?? "",
        sort: sortKey(state.sortBy),
        releases: state.refinementList?.release_key ?? [],
        areas: state.refinementList?.squads ?? [],
      };
    },
    routeToState(route: RouteState): UiState {
      return {
        [indexName]: {
          query: route.q || undefined,
          sortBy: ROADMAP_SORT_INDEXES[route.sort ?? "votes"],
          refinementList: {
            release_key: route.releases ?? [],
            squads: route.areas ?? [],
          },
        },
      };
    },
  },
});

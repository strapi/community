"use client";

import { createContext, useContext } from "react";

type RoadmapRouteValue = {
  /** Slug of the item whose own URL is being rendered. */
  item?: string;
  /** Path of the page the roadmap is on; defaults to the current path. */
  basePath?: string;
};

const RoadmapRouteContext = createContext<RoadmapRouteValue>({});

/**
 * Wraps the roadmap page when it's rendered at an item's own URL, so the
 * board opens that item and knows where to go back to on close.
 */
const RoadmapRoute = ({
  children,
  ...value
}: RoadmapRouteValue & { children: React.ReactNode }) => (
  <RoadmapRouteContext.Provider value={value}>
    {children}
  </RoadmapRouteContext.Provider>
);

const useRoadmapRoute = () => useContext(RoadmapRouteContext);

export { RoadmapRoute, useRoadmapRoute };

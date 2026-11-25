// Shared analytics params for roadmap events, so the card, dialog and board
// all describe an item the same way. Ids and closed-set values only: never
// titles or descriptions (see the rules in analytics/events.ts).

import type { RoadmapItem } from "./data";
import { displayStatus, isEdition, stringList } from "./types";

/**
 * Whether the item ships in the open-source edition, from its edition tags:
 * "yes" when tagged Core, "no" when only tagged with paid editions, and
 * undefined when it carries no edition tag at all.
 */
function openSource(item: RoadmapItem): "yes" | "no" | undefined {
  const editions = stringList(item.squads).filter(isEdition);
  if (editions.length === 0) return undefined;
  return editions.includes("Core") ? "yes" : "no";
}

/** The params every roadmap item event carries. */
export function roadmapItemParams(item: RoadmapItem) {
  return {
    roadmap_item_id: item.documentId,
    // The status label people see on the card and dialog badge.
    roadmap_status: displayStatus(item),
    release: item.release ?? undefined,
    open_source: openSource(item),
  };
}

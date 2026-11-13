"use client";

import { useState } from "react";
import {
  type RefinementListProps,
  useRefinementList,
} from "react-instantsearch";
import { Checkbox } from "@/components/ui/checkbox";

const COLLAPSED_COUNT = 5;

// `useRefinementList` defaults to only 10 facet values, which silently
// hid facets like the less-common countries. Fetch enough to cover every
// value (Meilisearch returns at most `maxValuesPerFacet`, 100 by default);
// the UI still collapses to `COLLAPSED_COUNT` behind a "Show more" toggle.
const DEFAULT_LIMIT = 100;

const RefinementList = (props: RefinementListProps) => {
  const { items, refine } = useRefinementList({
    limit: DEFAULT_LIMIT,
    ...props,
  });
  const [expanded, setExpanded] = useState(false);

  const visibleItems = expanded ? items : items.slice(0, COLLAPSED_COUNT);
  const hasMore = items.length > COLLAPSED_COUNT;

  return (
    <div className="flex w-full flex-col gap-2">
      {visibleItems.map((item) => {
        const id = `refinement-${props.attribute}-${String(item.value)}`;

        return (
          <label
            key={item.value}
            htmlFor={id}
            className="flex w-full cursor-pointer items-center gap-3 text-base font-normal text-(--color-neutral700)"
          >
            <Checkbox
              id={id}
              checked={item.isRefined}
              onCheckedChange={() => refine(item.value)}
            />
            <span className="leading-6">{item.label}</span>
            <span className="ml-auto text-sm text-(--color-neutral600)">
              {item.count}
            </span>
          </label>
        );
      })}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1 self-start text-sm font-medium text-(--color-primary600) hover:underline"
        >
          {expanded
            ? "Show less"
            : `Show ${items.length - COLLAPSED_COUNT} more`}
        </button>
      )}
    </div>
  );
};

export { RefinementList };

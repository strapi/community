import type { BaseHit } from "instantsearch.js";
import {
  type UseInfiniteHitsProps,
  useInfiniteHits,
} from "react-instantsearch";

type Props<T extends BaseHit> = UseInfiniteHitsProps<T> & {
  hitComponent: React.ComponentType<{ hit: T }>;
};

const GridHits = <T extends BaseHit>(props: Props<T>) => {
  const { hitComponent, ...restProps } = props;

  const Hit = hitComponent;

  const { items, isLastPage, showMore } = useInfiniteHits(restProps);

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((hit, key) => (
          <div key={`${key}-${hit.objectID}`}>
            <Hit hit={hit} />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        {!isLastPage && (
          <button
            type="button"
            onClick={showMore}
            className="rounded-md border border-(--color-primary200) px-4 py-2 text-sm font-semibold text-(--color-primary700) hover:bg-(--color-primary100)"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
};

export default GridHits;

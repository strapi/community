import type { BaseHit } from "instantsearch.js";
import {
  type UseInfiniteHitsProps,
  useInfiniteHits,
} from "react-instantsearch";
import { Button } from "@/components/ui/button";

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
        {items.map((hit) => (
          <div key={hit.objectID}>
            <Hit hit={hit} />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        {!isLastPage && (
          <Button variant="secondary" onClick={showMore}>
            Load more
          </Button>
        )}
      </div>
    </div>
  );
};

export { GridHits };

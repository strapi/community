import { Box, Button, Flex, Grid } from "@strapi/design-system";
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
    <Box width="100%">
      <Grid.Root gridCols={12} gap={4} width="100%">
        {items.map((hit, key) => (
          <Grid.Item col={4} key={`${key}-${hit.objectID}`}>
            <Hit hit={hit} />
          </Grid.Item>
        ))}
      </Grid.Root>
      <Flex justifyContent="center" marginTop="24px">
        {!isLastPage && (
          <Button onClick={showMore} size="L" variant="secondary">
            Load more
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default GridHits;

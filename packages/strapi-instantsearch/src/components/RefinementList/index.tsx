import { Box, Checkbox } from "@strapi/design-system";
import {
  type UseRefinementListProps,
  useRefinementList,
} from "react-instantsearch";

const RefinementList = (props: UseRefinementListProps) => {
  const { items, refine, canRefine } = useRefinementList(props);

  return (
    <Box>
      {items.map((item) => (
        <Checkbox
          disabled={!canRefine}
          onCheckedChange={() => refine(item.value)}
          key={item.value}
        >
          {item.label} ({item.count})
        </Checkbox>
      ))}
    </Box>
  );
};

export default RefinementList;

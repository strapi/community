import { SingleSelect, SingleSelectOption } from "@strapi/design-system";
import { type UseSortByProps, useSortBy } from "react-instantsearch";

const SortBy = (props: UseSortByProps) => {
  const { options, refine, currentRefinement } = useSortBy(props);

  return (
    <SingleSelect
      value={currentRefinement}
      onChange={(value) => refine(value as string)}
    >
      {options.map((option) => (
        <SingleSelectOption value={option.value} key={option.value}>
          {option.label}
        </SingleSelectOption>
      ))}
    </SingleSelect>
  );
};

export default SortBy;

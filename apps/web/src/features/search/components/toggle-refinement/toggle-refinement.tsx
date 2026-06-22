"use client";

import {
  type ToggleRefinementProps,
  useToggleRefinement,
} from "react-instantsearch";
import { Checkbox } from "@/components/ui/checkbox";

const ToggleRefinement = (props: ToggleRefinementProps) => {
  const { value, refine } = useToggleRefinement(props);
  const id = `toggle-${props.attribute}-${props.label}`;

  return (
    <label
      htmlFor={id}
      className="flex w-full cursor-pointer items-center gap-3 text-base font-normal text-(--color-neutral700)"
    >
      <Checkbox
        id={id}
        checked={value.isRefined}
        onCheckedChange={() => refine(value)}
      />
      <span className="leading-6">{props.label}</span>
      <span className="ml-auto text-sm text-(--color-neutral600)">
        {value.isRefined ? value.onFacetValue.count : value.offFacetValue.count}
      </span>
    </label>
  );
};

export { ToggleRefinement };

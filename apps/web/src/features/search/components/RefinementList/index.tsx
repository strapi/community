"use client";

import {
  type RefinementListProps,
  useRefinementList,
} from "react-instantsearch";
import { Checkbox } from "@/components/ui/checkbox";

const RefinementList = (props: RefinementListProps) => {
  const { items, refine } = useRefinementList(props);

  return (
    <div className="flex w-full flex-col gap-2">
      {items.map((item) => {
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
    </div>
  );
};

export default RefinementList;

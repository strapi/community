"use client";

import { type SortByProps, useSortBy } from "react-instantsearch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SortBy = (props: SortByProps) => {
  const { options, currentRefinement, refine } = useSortBy(props);

  return (
    <Select value={currentRefinement} onValueChange={refine}>
      <SelectTrigger>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SortBy;

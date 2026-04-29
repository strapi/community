"use client";

import { Button } from "@repo/strapi-ui";
import { Search } from "lucide-react";
import { type SearchBoxProps, useSearchBox } from "react-instantsearch";
import { Input } from "@/components/ui/input";

const SearchBox = (props: SearchBoxProps) => {
  const { query, refine } = useSearchBox(props);

  return (
    <form
      className="relative w-full"
      onSubmit={(event) => event.preventDefault()}
    >
      <Input
        value={query}
        onChange={(event) => refine(event.currentTarget.value)}
        placeholder="Search"
        className="pr-10"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
};

export { SearchBox };

"use client";

import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PartnerResourceSummary } from "../../lib/partner-portal";
import { ResourceGrid } from "./resource-section";
import { SectionHeader } from "./shared";

const ALL = "All";

export function ReusableContentSection({
  resources,
  hrefFor,
}: {
  resources: PartnerResourceSummary[];
  hrefFor: (resource: PartnerResourceSummary) => string;
}) {
  const [filter, setFilter] = useState(ALL);
  const [query, setQuery] = useState("");

  // Filter chips come from the categories editors actually use.
  const categories = [
    ...new Set(
      resources
        .map((resource) => resource.category)
        .filter((category): category is string => !!category),
    ),
  ];

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = resources.filter(
    (resource) =>
      (filter === ALL || resource.category === filter) &&
      (!normalizedQuery ||
        resource.title.toLowerCase().includes(normalizedQuery) ||
        resource.description?.toLowerCase().includes(normalizedQuery)),
  );

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <SectionHeader
        title="Reusable content"
        description="Approved assets to use in your own marketing and client pitches."
      >
        {resources.length > 0 && (
          <div className="relative w-full sm:w-64">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-(--color-neutral600)" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search assets"
              aria-label="Search assets"
              className="pl-9"
            />
          </div>
        )}
      </SectionHeader>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {[ALL, ...categories].map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={filter === category}
              onClick={() => setFilter(category)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === category
                  ? "border-(--color-neutral900) bg-(--color-neutral900) text-white"
                  : "border-(--color-neutral150) text-(--color-neutral700) hover:bg-(--color-neutral100)",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {resources.length > 0 && filtered.length === 0 ? (
        <p className="text-sm text-(--color-neutral600)">
          No assets match your search.
        </p>
      ) : (
        <ResourceGrid resources={filtered} hrefFor={hrefFor} />
      )}
    </div>
  );
}

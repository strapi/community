"use client";

import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import type { BaseHit } from "instantsearch.js";
import {
  BookOpen,
  Code2,
  LayoutTemplate,
  Monitor,
  Package,
  Search,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Configure, useHits, useSearchBox } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";

const { searchClient } = instantMeiliSearch(
  process.env.NEXT_PUBLIC_SEARCH_URL as string,
  process.env.NEXT_PUBLIC_SEARCH_API_KEY as string,
);

type SearchHit = BaseHit & {
  name?: string;
  title?: string;
  description?: string;
  type?: string;
};

const typeConfig: Record<
  string,
  { icon: React.ReactNode; badgeClass: string }
> = {
  plugin: {
    icon: <Package className="h-4 w-4 text-(--color-primary600)" />,
    badgeClass: "bg-(--color-primary700) text-white",
  },
  recipe: {
    icon: <BookOpen className="h-4 w-4 text-(--color-primary600)" />,
    badgeClass: "bg-(--color-primary600) text-white",
  },
  showcase: {
    icon: <Monitor className="h-4 w-4 text-(--color-primary600)" />,
    badgeClass: "bg-(--color-primary500) text-white",
  },
  template: {
    icon: <LayoutTemplate className="h-4 w-4 text-(--color-primary600)" />,
    badgeClass: "bg-(--color-primary700) text-white",
  },
};

const defaultTypeConfig = {
  icon: <Code2 className="h-4 w-4 text-(--color-primary600)" />,
  badgeClass: "bg-(--color-primary700) text-white",
};

const getTypeConfig = (type?: string) =>
  typeConfig[type?.toLowerCase() ?? ""] ?? defaultTypeConfig;

const SearchContent = ({ onClose }: { onClose: () => void }) => {
  const { query, refine } = useSearchBox();
  const { items } = useHits<SearchHit>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      {/* Input row */}
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="flex flex-1 items-center gap-2.5 rounded-lg border-2 border-(--color-primary500) bg-white px-3.5 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-(--color-primary500)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => refine(e.currentTarget.value)}
            placeholder="Search The Strapi Community"
            className="flex-1 bg-transparent text-sm text-(--color-neutral900) placeholder:text-(--color-neutral400) focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-sm font-medium text-(--color-neutral600) transition-colors hover:text-(--color-neutral900)"
        >
          Cancel
        </button>
      </div>

      {/* Results */}
      {query.length > 0 && items.length > 0 && (
        <div className="border-t border-(--color-neutral150) pb-2">
          <p className="px-5 pb-2 pt-3 text-sm font-semibold text-(--color-neutral800)">
            Most Relevant
          </p>
          <ul>
            {items.slice(0, 5).map((hit, i) => {
              const { icon, badgeClass } = getTypeConfig(hit.type);
              const label = hit.name ?? hit.title ?? "";
              const typeLabel = hit.type
                ? hit.type.charAt(0).toUpperCase() + hit.type.slice(1)
                : "Plugin";

              return (
                <li
                  key={hit.objectID}
                  className={
                    i > 0 ? "border-t border-(--color-neutral100)" : ""
                  }
                >
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex w-full items-center gap-3 px-5 py-3.5 transition-colors hover:bg-(--color-neutral50)"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-(--color-neutral150) bg-white">
                      {icon}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-semibold text-(--color-primary600)">
                        {label}
                      </p>
                      <p className="truncate text-xs text-(--color-neutral500)">
                        {hit.description}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${badgeClass}`}
                    >
                      {typeLabel}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const SearchDialog = ({ isOpen, onClose }: Props) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close search"
        className="fixed inset-x-0 bottom-0 top-18 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed left-1/2 top-[84px] z-50 w-full max-w-[540px] -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <InstantSearchNext
          indexName="generic_search:npm_downloads:asc"
          searchClient={searchClient}
        >
          <Configure hitsPerPage={5} />
          <SearchContent onClose={onClose} />
        </InstantSearchNext>
      </div>
    </>
  );
};

export { SearchDialog };

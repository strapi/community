"use client";

import { CategorySelect } from "@/features/submit/components/category-select";
import type { SubmissionCategory } from "../../lib/types";

/**
 * Wraps the public submit form's `CategorySelect` (unmodified) rather than
 * changing it — that component operates on plain category name strings,
 * which is fine for the submit flow's name-based creation, but editing an
 * existing entry needs to write the `categories` relation back by
 * `documentId`. This adapter keeps `{documentId, name}[]` state and
 * translates to/from `CategorySelect`'s `string[]` props.
 */
export function CategoryPicker({
  allCategories,
  selected,
  onChange,
  disabled,
}: {
  allCategories: SubmissionCategory[];
  selected: SubmissionCategory[];
  onChange: (next: SubmissionCategory[]) => void;
  disabled?: boolean;
}) {
  const byName = (name: string) =>
    allCategories.find((category) => category.name === name);

  return (
    <fieldset disabled={disabled} className="contents">
      <CategorySelect
        allCategories={allCategories.map((category) => category.name)}
        selected={selected.map((category) => category.name)}
        onAdd={(name) => {
          const category = byName(name);
          if (
            category &&
            !selected.some((c) => c.documentId === category.documentId)
          ) {
            onChange([...selected, category]);
          }
        }}
        onRemove={(name) => {
          onChange(selected.filter((category) => category.name !== name));
        }}
      />
    </fieldset>
  );
}

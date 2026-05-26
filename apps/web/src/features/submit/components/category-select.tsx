function CategoryPill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-(--color-primary100) px-3 py-1 text-xs font-medium text-(--color-primary700)">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 rounded-full p-0.5 hover:bg-(--color-primary200)"
        aria-label={`Remove ${label}`}
      >
        ×
      </button>
    </span>
  );
}

export function CategorySelect({
  allCategories,
  selected,
  onAdd,
  onRemove,
}: {
  allCategories: string[];
  selected: string[];
  onAdd: (cat: string) => void;
  onRemove: (cat: string) => void;
}) {
  const available = allCategories.filter((c) => !selected.includes(c));

  return (
    <>
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selected.map((c) => (
            <CategoryPill key={c} label={c} onRemove={() => onRemove(c)} />
          ))}
        </div>
      )}
      <select
        id="category_select"
        className="flex h-10 w-full rounded-md border border-(--color-neutral150) bg-white px-3 py-2 text-sm text-(--color-neutral900) shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none focus:border-(--color-primary200)"
        value=""
        onChange={(e) => {
          onAdd(e.target.value);
          e.target.value = "";
        }}
      >
        <option value="">
          {allCategories.length === 0
            ? "No categories available"
            : available.length === 0
              ? "All categories selected"
              : "Select a category to add…"}
        </option>
        {available.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </>
  );
}

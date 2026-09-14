"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { findUserBySlug } from "../../lib/submission-edit";
import type { SubmissionMaintainer } from "../../lib/types";

function MaintainerPill({
  maintainer,
  onRemove,
}: {
  maintainer: SubmissionMaintainer;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-(--color-primary100) px-3 py-1 text-xs font-medium text-(--color-primary700)">
      {maintainer.name ?? maintainer.documentId}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 rounded-full p-0.5 hover:bg-(--color-primary200)"
        aria-label={`Remove ${maintainer.name ?? "maintainer"}`}
      >
        ×
      </button>
    </span>
  );
}

/**
 * Add/remove pill picker for `maintainers`. Deliberately **not** a
 * search-as-you-type: the owner types the maintainer's exact slug
 * (already public — it's their profile URL) and clicks "Add", which does
 * one exact lookup — no autocomplete, so this can't be used to look up
 * users by name or email. Adding is immediate, per the confirmed product
 * decision (no invite/accept step).
 */
export function MaintainerPicker({
  selected,
  onAdd,
  onRemove,
  disabled,
}: {
  selected: SubmissionMaintainer[];
  onAdd: (maintainer: SubmissionMaintainer) => void;
  onRemove: (documentId: string) => void;
  disabled?: boolean;
}) {
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    const trimmed = slug.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    const found = await findUserBySlug(trimmed);
    setLoading(false);

    if (!found) {
      setError("No user with that slug.");
      return;
    }
    if (
      selected.some((maintainer) => maintainer.documentId === found.documentId)
    ) {
      setError("Already a maintainer.");
      return;
    }

    onAdd({
      documentId: found.documentId,
      name: found.name,
      image: found.image,
    });
    setSlug("");
  };

  return (
    <div className="flex flex-col gap-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((maintainer) => (
            <MaintainerPill
              key={maintainer.documentId}
              maintainer={maintainer}
              onRemove={() => onRemove(maintainer.documentId)}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="User's slug"
          value={slug}
          disabled={disabled}
          onChange={(e) => setSlug(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            handleAdd();
          }}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || loading || !slug.trim()}
          className="shrink-0 rounded-md border border-(--color-neutral150) px-3 py-2 text-sm font-medium text-(--color-neutral800) hover:bg-(--color-neutral100) disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Adding…" : "Add"}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

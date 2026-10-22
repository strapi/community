"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  findOrganizationBySlug,
  findUserBySlug,
} from "../../lib/submission-edit";
import type { OwnerType } from "../../lib/types";

export type PickedOwner = {
  documentId: string;
  type: OwnerType;
  name: string;
  slug: string;
};

const DEFAULT_KIND: OwnerType = "plugin::better-auth.user";

const DEFAULT_OPTION = {
  type: DEFAULT_KIND,
  label: "User",
  placeholder: "User's slug",
};

const KINDS: { type: OwnerType; label: string; placeholder: string }[] = [
  DEFAULT_OPTION,
  {
    type: "plugin::better-auth.organization",
    label: "Organization",
    placeholder: "Organization's slug",
  },
];

/**
 * Single-select picker for a transfer target — either a user or an
 * organization, per the confirmed product decision that transfer can go
 * to either. Deliberately **not** a search-as-you-type: the owner types
 * the exact slug (already public — it's the account/org's profile URL)
 * and clicks "Find", which does one exact lookup. No autocomplete, so
 * this can't be used to enumerate users by name or email.
 */
export function OwnerPicker({
  value,
  onChange,
}: {
  value: PickedOwner | null;
  onChange: (owner: PickedOwner | null) => void;
}) {
  const [kind, setKind] = useState<OwnerType>(DEFAULT_KIND);
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current =
    KINDS.find((option) => option.type === kind) ?? DEFAULT_OPTION;

  const handleFind = async () => {
    const trimmed = slug.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    const found =
      kind === "plugin::better-auth.user"
        ? await findUserBySlug(trimmed)
        : await findOrganizationBySlug(trimmed);

    setLoading(false);

    if (!found) {
      setError(
        kind === "plugin::better-auth.user"
          ? "No user with that slug."
          : "No organization with that slug.",
      );
      return;
    }

    onChange({
      documentId: found.documentId,
      type: kind,
      name: found.name ?? found.slug,
      slug: found.slug,
    });
    setSlug("");
  };

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-md border border-(--color-neutral150) bg-white px-3 py-2 text-sm">
        <span>
          {value.name}{" "}
          <span className="text-(--color-neutral600)">
            (@{value.slug},{" "}
            {value.type === "plugin::better-auth.user"
              ? "user"
              : "organization"}
            )
          </span>
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-(--color-neutral600) hover:text-red-600"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {KINDS.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => {
              setKind(option.type);
              setSlug("");
              setError(null);
            }}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              kind === option.type
                ? "bg-(--color-primary600) text-white"
                : "bg-(--color-neutral100) text-(--color-neutral700)",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder={current.placeholder}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            handleFind();
          }}
        />
        <button
          type="button"
          onClick={handleFind}
          disabled={loading || !slug.trim()}
          className="shrink-0 rounded-md border border-(--color-neutral150) px-3 py-2 text-sm font-medium text-(--color-neutral800) hover:bg-(--color-neutral100) disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Finding…" : "Find"}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

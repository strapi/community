"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MAX_PROFILE_LINKS,
  normalizeProfileLinkValue,
  PROFILE_LINK_TYPE_CONFIG,
  PROFILE_LINK_TYPES,
  type ProfileLink,
  type ProfileLinkType,
  validateProfileLink,
} from "@/lib/profile-links";
import { cn } from "@/lib/utils";

const invalidClassName = "border-red-400 focus-visible:border-red-400";

/**
 * Editor for the repeatable `links` profile field — one row per link with
 * a type select and either a handle (social types, shown after their URL
 * prefix) or a full URL (`website`/`other`). Order is kept as entered.
 */
export function ProfileLinksField({
  id,
  links,
  onChange,
  disabled,
  submitAttempted,
}: {
  id: string;
  links: ProfileLink[];
  onChange: (links: ProfileLink[]) => void;
  disabled: boolean;
  submitAttempted: boolean;
}) {
  // Parallel to `links`; kept in step on add/remove so a fresh row doesn't
  // inherit the error state of the one it replaced.
  const [touched, setTouched] = useState<boolean[]>([]);

  const updateLink = (index: number, patch: Partial<ProfileLink>) =>
    onChange(
      links.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    );

  const addLink = () => {
    onChange([...links, { type: "website", value: "" }]);
    setTouched((prev) => [...prev.slice(0, links.length), false]);
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
    setTouched((prev) => prev.filter((_, i) => i !== index));
  };

  const markTouched = (index: number) =>
    setTouched((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });

  return (
    <div id={id} className="flex flex-col gap-2">
      {links.length === 0 && (
        <p className="text-sm text-(--color-neutral600)">
          Add your website or where people can find you online.
        </p>
      )}

      {links.map((link, index) => {
        const config = PROFILE_LINK_TYPE_CONFIG[link.type];
        const error =
          touched[index] || submitAttempted
            ? validateProfileLink(link)
            : undefined;

        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: links have no stable id until saved, and every input is controlled.
          <div key={index} className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <Select
                value={link.type}
                disabled={disabled}
                onValueChange={(type) =>
                  updateLink(index, {
                    type: type as ProfileLinkType,
                    value: normalizeProfileLinkValue(
                      type as ProfileLinkType,
                      link.value,
                    ),
                  })
                }
              >
                <SelectTrigger
                  aria-label={`Link ${index + 1} type`}
                  className="w-40 min-w-40 shrink-0"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROFILE_LINK_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {PROFILE_LINK_TYPE_CONFIG[type].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex min-w-0 flex-1">
                {config.handle && (
                  <span className="flex h-10 shrink-0 items-center rounded-l-md border border-r-0 border-(--color-neutral150) bg-(--color-neutral100) px-3 text-sm text-(--color-neutral600)">
                    {config.handle.prefix}
                  </span>
                )}
                <Input
                  aria-label={`Link ${index + 1} ${config.handle ? "username" : "address"}`}
                  placeholder={
                    config.handle
                      ? config.handle.example
                      : "https://example.com"
                  }
                  disabled={disabled}
                  value={link.value}
                  aria-invalid={Boolean(error)}
                  onChange={(event) =>
                    updateLink(index, { value: event.target.value })
                  }
                  onBlur={() => {
                    updateLink(index, {
                      value: normalizeProfileLinkValue(link.type, link.value),
                    });
                    markTouched(index);
                  }}
                  className={cn(
                    "min-w-0",
                    config.handle && "rounded-l-none",
                    error && invalidClassName,
                  )}
                />
              </div>

              <button
                type="button"
                disabled={disabled}
                onClick={() => removeLink(index)}
                aria-label={`Remove link ${index + 1}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-(--color-neutral600) hover:bg-(--color-neutral100) hover:text-(--color-neutral900) disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {error && (
              <p role="alert" className="text-xs text-red-600">
                {error}
              </p>
            )}
          </div>
        );
      })}

      {links.length < MAX_PROFILE_LINKS && (
        <button
          type="button"
          disabled={disabled}
          onClick={addLink}
          className="flex w-fit items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-(--color-primary600) hover:bg-(--color-primary100) disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add link
        </button>
      )}
    </div>
  );
}

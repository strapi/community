"use client";

import { MarkdownEditor } from "@/components/content/markdown-editor";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Hint, Label } from "../field";

/**
 * Readme sync toggle, checked by default (mirrors `readme_auto_sync`
 * defaulting to `true` in the CMS) — the editor only appears once the
 * submitter unchecks it.
 */
export function ReadmeField({
  type,
  readme,
  autoSync,
  onReadmeChange,
  onAutoSyncChange,
  placeholder,
  disabled,
  className,
}: {
  type: "package" | "template";
  readme: string;
  autoSync: boolean;
  onReadmeChange: (value: string) => void;
  onAutoSyncChange: (value: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <label
        className={cn(
          "flex items-start gap-3",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )}
        htmlFor="readme_auto_sync"
      >
        <Checkbox
          id="readme_auto_sync"
          checked={autoSync}
          disabled={disabled}
          onCheckedChange={(checked) => onAutoSyncChange(checked === true)}
        />
        <span className="flex flex-col">
          <span className="text-sm leading-relaxed text-(--color-neutral700)">
            Automatically sync the Readme
          </span>
          <Hint>
            Kept in sync with the{" "}
            {type === "package" ? "package registry" : "git repository"}.
            Uncheck to write it yourself instead.
          </Hint>
        </span>
      </label>

      {!autoSync && (
        <div>
          <Label htmlFor="readme">README / Documentation</Label>
          <MarkdownEditor
            id="readme"
            value={readme}
            onChange={onReadmeChange}
            placeholder={placeholder}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { MarkdownEditor } from "@/components/content/markdown-editor";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { COPY } from "./fields";
import type { Field, Profile, Props } from "./types";
import {
  BIO_MAX_LENGTH,
  SUBTITLE_MAX_LENGTH,
  validateProfile,
  validateProfileField,
} from "./validation";

const FIELD_MAX_LENGTHS: Partial<Record<keyof Profile, number>> = {
  bio: BIO_MAX_LENGTH,
  subtitle: SUBTITLE_MAX_LENGTH,
};

const textareaClassName =
  "flex w-full rounded-md border border-(--color-neutral150) bg-white px-3 py-2 text-sm text-(--color-neutral900) shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-(--color-neutral600) focus-visible:border-(--color-primary200) disabled:cursor-not-allowed disabled:opacity-50";

const invalidClassName = "border-red-400 focus-visible:border-red-400";

export function ProfileForm({
  variant,
  fields,
  values,
  setValues,
  disabled,
  onSubmit,
}: {
  variant: Props["variant"];
  fields: Field[];
  values: Profile;
  setValues: (updater: (prev: Profile) => Profile) => void;
  disabled: boolean;
  onSubmit: (event: React.FormEvent) => void;
}) {
  const { heading, description } = COPY[variant];

  const [touched, setTouched] = useState<
    Partial<Record<keyof Profile, boolean>>
  >({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const errors = validateProfile(values);

  const markTouched = (name: keyof Profile) =>
    setTouched((prev) => ({ ...prev, [name]: true }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (Object.keys(errors).length > 0) {
      setSubmitAttempted(true);
      setTouched(Object.fromEntries(fields.map((field) => [field.name, true])));
      return;
    }

    onSubmit(event);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full flex-col gap-4 rounded-md border border-(--color-neutral150) bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-base font-semibold text-(--color-neutral900)">
          {heading}
        </h2>
        <p className="text-sm text-(--color-neutral600)">{description}</p>
      </div>

      <div className="flex flex-col gap-4">
        {fields.map((field) => {
          const value = values[field.name] ?? "";
          const showError = Boolean(touched[field.name] || submitAttempted);
          const error = showError
            ? validateProfileField(field.name, value)
            : undefined;

          return (
            <div key={field.name} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium text-(--color-neutral800)"
                >
                  {field.label}
                </label>
                {field.name in FIELD_MAX_LENGTHS && (
                  <span
                    className={cn(
                      "text-xs text-(--color-neutral600)",
                      value.length > FIELD_MAX_LENGTHS[field.name]! &&
                        "text-red-600",
                    )}
                  >
                    {value.length}/{FIELD_MAX_LENGTHS[field.name]}
                  </span>
                )}
              </div>
              {field.name === "readme" ? (
                <MarkdownEditor
                  id={field.name}
                  value={value}
                  disabled={disabled}
                  onChange={(next) =>
                    setValues((prev) => ({ ...prev, [field.name]: next }))
                  }
                />
              ) : field.multiline ? (
                <textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  disabled={disabled}
                  rows={field.large ? 8 : 3}
                  value={value}
                  aria-invalid={Boolean(error)}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      [field.name]: event.target.value,
                    }))
                  }
                  onBlur={() => markTouched(field.name)}
                  className={cn(textareaClassName, error && invalidClassName)}
                />
              ) : (
                <Input
                  id={field.name}
                  placeholder={field.placeholder}
                  disabled={disabled}
                  value={value}
                  aria-invalid={Boolean(error)}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      [field.name]: event.target.value,
                    }))
                  }
                  onBlur={() => markTouched(field.name)}
                  className={cn(error && invalidClassName)}
                />
              )}
              {error && (
                <p role="alert" className="text-xs text-red-600">
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-md bg-(--color-primary600) px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </form>
  );
}

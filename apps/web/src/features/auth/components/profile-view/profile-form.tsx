"use client";

import { Input } from "@/components/ui/input";
import { COPY } from "./fields";
import type { Field, Profile, Props } from "./types";

const textareaClassName =
  "flex w-full rounded-md border border-(--color-neutral150) bg-white px-3 py-2 text-sm text-(--color-neutral900) shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-(--color-neutral600) focus-visible:border-(--color-primary200) disabled:cursor-not-allowed disabled:opacity-50";

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

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-4 rounded-md border border-(--color-neutral150) bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-base font-semibold text-(--color-neutral900)">
          {heading}
        </h2>
        <p className="text-sm text-(--color-neutral600)">{description}</p>
      </div>

      <div className="flex flex-col gap-4">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-(--color-neutral800)"
            >
              {field.label}
            </label>
            {field.multiline ? (
              <textarea
                id={field.name}
                placeholder={field.placeholder}
                disabled={disabled}
                rows={field.large ? 8 : 3}
                value={values[field.name] ?? ""}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    [field.name]: event.target.value,
                  }))
                }
                className={textareaClassName}
              />
            ) : (
              <Input
                id={field.name}
                placeholder={field.placeholder}
                disabled={disabled}
                value={values[field.name] ?? ""}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    [field.name]: event.target.value,
                  }))
                }
              />
            )}
          </div>
        ))}
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

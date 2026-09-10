"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  getUserProfile,
  type UserProfile,
  updateUserProfile,
} from "../lib/user-profile";

type Field = {
  name: keyof UserProfile;
  label: string;
  placeholder: string;
  multiline?: boolean;
  large?: boolean;
};

const FIELDS: Field[] = [
  {
    name: "subtitle",
    label: "Subtitle",
    placeholder: "A short tagline about you",
  },
  {
    name: "bio",
    label: "Bio",
    placeholder: "Tell the community about yourself",
    multiline: true,
  },
  { name: "website", label: "Website", placeholder: "https://example.com" },
  {
    name: "github",
    label: "GitHub",
    placeholder: "https://github.com/your-username",
  },
  { name: "location", label: "Location", placeholder: "City, Country" },
  {
    name: "email",
    label: "Public email",
    placeholder: "A contact address shown on your public profile",
  },
  {
    name: "readme",
    label: "Readme",
    placeholder: "Markdown supported",
    multiline: true,
    large: true,
  },
];

const textareaClassName =
  "flex w-full rounded-md border border-(--color-neutral150) bg-white px-3 py-2 text-sm text-(--color-neutral900) shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-(--color-neutral600) focus-visible:border-(--color-primary200) disabled:cursor-not-allowed disabled:opacity-50";

/**
 * The personal "Profile" tab — edits the `api::profile.profile` fields
 * the public user page renders (bio/subtitle/website/github/location/
 * email/readme). Mirrors `OrganizationProfileCard`, but the initial
 * values are fetched client-side (via the session cookie) rather than
 * passed down as a server-fetched prop, since `/account` has no slug-like
 * param to key a server-side read off — see
 * `apps/web/src/app/account/[[...path]]/page.tsx`. Saved through our own
 * `PUT /users/me/profile` endpoint.
 */
export function UserProfileCard() {
  const [values, setValues] = useState<UserProfile>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    getUserProfile().then((profile) => {
      if (!active) return;
      setValues(profile ?? {});
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsSubmitting(true);
    const updated = await updateUserProfile(values);
    setIsSubmitting(false);

    if (updated) {
      setValues(updated);
      toast.success("Profile updated successfully.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-4 rounded-md border border-(--color-neutral150) bg-white p-6 shadow-sm">
        <div className="h-5 w-40 animate-pulse rounded bg-(--color-neutral150)" />
        <div className="h-24 w-full animate-pulse rounded bg-(--color-neutral150)" />
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-4 rounded-md border border-(--color-neutral150) bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-base font-semibold text-(--color-neutral900)">
          Profile
        </h2>
        <p className="text-sm text-(--color-neutral600)">
          Shown on your public profile page.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {FIELDS.map((field) => (
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
          disabled={isSubmitting}
          className="rounded-md bg-(--color-primary600) px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </form>
  );
}

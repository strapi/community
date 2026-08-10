"use client";

import { AuthUIContext } from "@daveyplate/better-auth-ui";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  type OrganizationProfile,
  updateOrganizationProfile,
} from "../lib/organization-profile";

type Props = {
  organizationId?: string;
  initialProfile?: OrganizationProfile;
};

type Field = {
  name: keyof OrganizationProfile;
  label: string;
  placeholder: string;
  multiline?: boolean;
  large?: boolean;
};

const FIELDS: Field[] = [
  {
    name: "subtitle",
    label: "Subtitle",
    placeholder: "A short tagline for your organization",
  },
  {
    name: "bio",
    label: "Bio",
    placeholder: "Tell the community about your organization",
    multiline: true,
  },
  { name: "website", label: "Website", placeholder: "https://example.com" },
  {
    name: "github",
    label: "GitHub",
    placeholder: "https://github.com/your-org",
  },
  { name: "location", label: "Location", placeholder: "City, Country" },
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
 * The organization "Profile" tab — edits the `api::profile.profile`
 * fields the public organization page renders (bio/subtitle/website/
 * github/location/readme). Unlike the built-in cards
 * (`OrganizationNameCard`, etc.), these fields aren't known to
 * better-auth's own organization object, so they're read as a server-
 * fetched prop (see `apps/web/src/app/org/[slug]/[[...path]]/page.tsx`)
 * rather than via `useCurrentOrganization`, and saved through our own
 * `PUT /organizations/:id/profile` endpoint instead of
 * `mutators.updateOrganization`.
 */
export function OrganizationProfileCard({
  organizationId,
  initialProfile,
}: Props) {
  if (!organizationId) {
    return (
      <div className="flex w-full flex-col gap-4 rounded-md border border-(--color-neutral150) bg-white p-6 shadow-sm">
        <div className="h-5 w-40 animate-pulse rounded bg-(--color-neutral150)" />
        <div className="h-24 w-full animate-pulse rounded bg-(--color-neutral150)" />
      </div>
    );
  }

  return (
    <OrganizationProfileForm
      organizationId={organizationId}
      initialProfile={initialProfile}
    />
  );
}

function OrganizationProfileForm({
  organizationId,
  initialProfile,
}: { organizationId: string } & Pick<Props, "initialProfile">) {
  const {
    hooks: { useHasPermission },
  } = useContext(AuthUIContext);

  const { data: hasPermission, isPending: permissionPending } =
    useHasPermission({
      organizationId,
      permissions: { organization: ["update"] },
    });

  const [values, setValues] = useState<OrganizationProfile>(
    initialProfile ?? {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const disabled = permissionPending || !hasPermission?.success;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsSubmitting(true);
    const updated = await updateOrganizationProfile(organizationId, values);
    setIsSubmitting(false);

    if (updated) {
      setValues(updated);
      toast.success("Organization profile updated successfully.");
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-4 rounded-md border border-(--color-neutral150) bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-base font-semibold text-(--color-neutral900)">
          Organization profile
        </h2>
        <p className="text-sm text-(--color-neutral600)">
          Shown on your organization&apos;s public page.
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
                disabled={disabled || isSubmitting}
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
                disabled={disabled || isSubmitting}
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
          disabled={disabled || isSubmitting}
          className="rounded-md bg-(--color-primary600) px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </form>
  );
}

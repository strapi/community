"use client";

import {
  AuthUIContext,
  SettingsCard,
  type SettingsCardClassNames,
  useCurrentOrganization,
} from "@daveyplate/better-auth-ui";
import type { Organization } from "better-auth/plugins/organization";
import { useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Who may submit packages/templates on behalf of the organization —
 * mirrors the `submission_policy` better-auth `additionalFields` entry in
 * the CMS's `lib/auth.ts`.
 */
type SubmissionPolicy = "admins" | "members";

const OPTIONS: { value: SubmissionPolicy; label: string; hint: string }[] = [
  {
    value: "admins",
    label: "Owners and admins",
    hint: "Only owners and admins can submit plugins and templates for this organization.",
  },
  {
    value: "members",
    label: "All members",
    hint: "Every member of this organization can submit plugins and templates for it.",
  },
];

const DESCRIPTION =
  "Choose who can submit plugins and templates on behalf of this organization.";
const INSTRUCTIONS = "Owners and admins can always submit.";

function CardSkeleton({ classNames }: { classNames?: SettingsCardClassNames }) {
  return (
    <div className={cn("px-6", classNames?.content)}>
      <div
        className={cn(
          "h-24 w-full animate-pulse rounded-md bg-accent",
          classNames?.skeleton,
        )}
      />
    </div>
  );
}

/**
 * Lets an organization's owners/admins choose who may submit
 * packages/templates on its behalf. better-auth-ui's
 * `OrganizationSettingsCards` doesn't render organization
 * `additionalFields`, so this is a custom card — but built on the
 * library's own `SettingsCard` and saved through the same
 * `updateOrganization` mutator its name/slug cards use (which
 * better-auth restricts to owners/admins), so it looks and behaves like
 * its siblings. Hidden entirely for plain members.
 */
export function SubmissionPolicyCard({
  slug,
  classNames,
}: {
  slug?: string;
  classNames?: SettingsCardClassNames;
}) {
  const { data: organization, refetch: refetchOrganization } =
    useCurrentOrganization({ slug });

  // Like better-auth-ui's own cards, only mount the form (and its
  // `useHasPermission` call) once the organization is loaded — called
  // with an `undefined` organizationId, better-auth falls back to the
  // session's *active* organization and 400s with NO_ACTIVE_ORGANIZATION.
  if (!organization) {
    return (
      <SettingsCard
        classNames={classNames}
        title="Submissions"
        description={DESCRIPTION}
        instructions={INSTRUCTIONS}
        actionLabel="Save"
        isPending
      >
        <CardSkeleton classNames={classNames} />
      </SettingsCard>
    );
  }

  return (
    <SubmissionPolicyForm
      classNames={classNames}
      organization={organization}
      refetchOrganization={refetchOrganization}
    />
  );
}

function SubmissionPolicyForm({
  classNames,
  organization,
  refetchOrganization,
}: {
  classNames?: SettingsCardClassNames;
  organization: Organization;
  refetchOrganization?: () => Promise<unknown> | unknown;
}) {
  const {
    hooks: { useHasPermission },
    mutators: { updateOrganization },
    optimistic,
    toast,
  } = useContext(AuthUIContext);

  const { data: hasPermission, isPending } = useHasPermission({
    organizationId: organization.id,
    permissions: { organization: ["update"] },
  });

  // Not on better-auth's own `Organization` type — it's a custom
  // `additionalFields` entry. `null` (organizations created before the
  // setting existed) means the default, "admins".
  const saved: SubmissionPolicy =
    (organization as { submission_policy?: SubmissionPolicy | null })
      .submission_policy ?? "admins";

  const [value, setValue] = useState<SubmissionPolicy>(saved);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => setValue(saved), [saved]);

  if (!isPending && !hasPermission?.success) return null;

  const save = async () => {
    setIsSubmitting(true);
    try {
      await updateOrganization({
        organizationId: organization.id,
        data: { submission_policy: value },
      });
      await refetchOrganization?.();
      toast({
        variant: "success",
        message: "Submission settings updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update submission settings.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SettingsCard
      classNames={classNames}
      title="Submissions"
      description={DESCRIPTION}
      instructions={INSTRUCTIONS}
      actionLabel="Save"
      isPending={isPending}
      isSubmitting={isSubmitting}
      optimistic={optimistic}
      disabled={value === saved}
      action={save}
    >
      {isPending ? (
        <CardSkeleton classNames={classNames} />
      ) : (
        <div className={cn("px-6", classNames?.content)}>
          <fieldset className="flex flex-col gap-2" disabled={isSubmitting}>
            <legend className="sr-only">Who can submit</legend>
            {OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 text-sm transition-colors",
                  value === option.value
                    ? "border-primary bg-accent"
                    : "hover:bg-accent/50",
                )}
              >
                <input
                  type="radio"
                  name="submission_policy"
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => setValue(option.value)}
                  className="mt-0.5 accent-primary"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-muted-foreground">{option.hint}</span>
                </span>
              </label>
            ))}
          </fieldset>
        </div>
      )}
    </SettingsCard>
  );
}

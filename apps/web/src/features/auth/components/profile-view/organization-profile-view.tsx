"use client";

import { AuthUIContext } from "@daveyplate/better-auth-ui";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { updateOrganizationProfile } from "../../lib/organization-profile";
import { ORGANIZATION_FIELDS } from "./fields";
import { ProfileForm } from "./profile-form";
import type { Profile, Props } from "./types";

export function OrganizationProfileView({
  organizationId,
  initialProfile,
}: { organizationId: string } & Pick<
  Extract<Props, { variant: "organization" }>,
  "initialProfile"
>) {
  const {
    hooks: { useHasPermission },
  } = useContext(AuthUIContext);

  const { data: hasPermission, isPending: permissionPending } =
    useHasPermission({
      organizationId,
      permissions: { organization: ["update"] },
    });

  const [values, setValues] = useState<Profile>(initialProfile ?? {});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const disabled = permissionPending || !hasPermission?.success || isSubmitting;

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
    <ProfileForm
      variant="organization"
      fields={ORGANIZATION_FIELDS}
      values={values}
      setValues={setValues}
      disabled={disabled}
      onSubmit={onSubmit}
    />
  );
}

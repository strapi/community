"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getUserProfile, updateUserProfile } from "../../lib/user-profile";
import { USER_FIELDS } from "./fields";
import { ProfileForm } from "./profile-form";
import { ProfileSkeleton } from "./profile-skeleton";
import type { Profile } from "./types";

export function UserProfileView() {
  const [values, setValues] = useState<Profile>({});
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

  if (isLoading) return <ProfileSkeleton />;

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

  return (
    <ProfileForm
      variant="user"
      fields={USER_FIELDS}
      values={values}
      setValues={setValues}
      disabled={isSubmitting}
      onSubmit={onSubmit}
    />
  );
}

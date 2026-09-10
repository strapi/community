import type { OrganizationProfile } from "../../lib/organization-profile";
import type { UserProfile } from "../../lib/user-profile";

export type Profile = UserProfile & OrganizationProfile;

export type Props =
  | { variant: "user" }
  | {
      variant: "organization";
      organizationId?: string;
      initialProfile?: OrganizationProfile;
    };

export type Field = {
  name: keyof Profile;
  label: string;
  placeholder: string;
  multiline?: boolean;
  large?: boolean;
};

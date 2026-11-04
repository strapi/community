import type { OrganizationProfile } from "../../lib/organization-profile";
import type { UserProfile } from "../../lib/user-profile";

export type Profile = UserProfile & OrganizationProfile;

/** The `Profile` keys holding text — the ones rendered as form fields. */
export type TextField = {
  [K in keyof Profile]-?: Profile[K] extends string | null | undefined
    ? K
    : never;
}[keyof Profile];

export type Props =
  | { variant: "user" }
  | {
      variant: "organization";
      organizationId?: string;
      initialProfile?: OrganizationProfile;
    };

export type Field = {
  name: TextField;
  label: string;
  placeholder: string;
  multiline?: boolean;
  large?: boolean;
};

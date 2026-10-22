"use client";

import { OrganizationProfileView } from "./organization-profile-view";
import { ProfileSkeleton } from "./profile-skeleton";
import type { Props } from "./types";
import { UserProfileView } from "./user-profile-view";

/**
 * The "Profile" tab shared by `AccountView` and `OrganizationView` — edits
 * the `api::profile.profile` fields the public user/organization pages
 * render (bio/subtitle/website/github/location/readme, plus a public email
 * for users). The two variants differ in where their initial values come
 * from and how they're saved:
 *
 * - `variant="user"`: values are fetched client-side (via the session
 *   cookie), since `/account` has no slug-like param to key a server-side
 *   read off — see `apps/web/src/app/account/[[...path]]/page.tsx`. Saved
 *   through `PUT /users/me/profile`.
 * - `variant="organization"`: values aren't known to better-auth's own
 *   organization object, so they're read as a server-fetched prop (see
 *   `apps/web/src/app/org/[slug]/[[...path]]/page.tsx`) rather than via
 *   `useCurrentOrganization`, and saved through `PUT
 *   /organizations/:id/profile`.
 */
export function ProfileView(props: Props) {
  if (props.variant === "organization") {
    if (!props.organizationId) return <ProfileSkeleton />;

    return (
      <OrganizationProfileView
        organizationId={props.organizationId}
        initialProfile={props.initialProfile}
      />
    );
  }

  return <UserProfileView />;
}

import type { UID } from "@strapi/strapi";
import { auth } from "../../../lib/auth";
import type services from "../services";

export const extractContentTypeName = (uid: UID.ContentType) =>
  uid.split(".")[1];

/**
 * A helper function to obtain a plugin service.
 * @param {string} name The name of the service.
 *
 * @return {any} service.
 */
type Services = typeof services;
export const getPluginService = <ServiceName extends keyof Services>(
  name: ServiceName,
) => {
  const service = strapi.service(`plugin::better-auth.${name}`);
  return service as ReturnType<Services[ServiceName]>;
};

export const communityContentTypes: UID.ContentType[] = [
  "api::package.package",
  "api::template.template",
];

/**
 * `api::profile.profile` fields an org owner/admin may edit through the
 * organization "Profile" tab — scoped to exactly what the public
 * organization page renders (bio/subtitle/website/github/location/readme).
 */
export const organizationProfileFields = [
  "bio",
  "subtitle",
  "website",
  "github",
  "location",
  "readme",
] as const;

/**
 * `api::profile.profile` fields a user may edit through their personal
 * "Profile" tab — scoped to exactly what the public user page renders
 * (bio/subtitle/website/github/location/email/readme). Includes `email`
 * (a public contact address), unlike `organizationProfileFields` — an
 * organization has no equivalent distinct-from-account address.
 */
export const userProfileFields = [
  "bio",
  "subtitle",
  "website",
  "github",
  "location",
  "email",
  "readme",
] as const;

/**
 * Uploads a file to the media library, linked to the uploading user via
 * the native `related` morph field on `plugin::upload.file` — the same
 * mechanism Strapi's own upload plugin uses internally for
 * `POST /api/upload?ref=X&refId=Y&field=Z`. Used for avatar/logo uploads,
 * where ownership needs to be checked later (`deleteOwnedFile`) but the
 * file isn't attached to a real `type: "media"` attribute anywhere.
 */
export async function uploadOwnedFile({
  userId,
  file,
  field,
  name,
}: {
  userId: string | number;
  file: unknown;
  field: string;
  name: string;
}) {
  const [uploaded] = await strapi
    .plugin("upload")
    .service("upload")
    .upload({
      data: {
        fileInfo: { name },
        ref: "plugin::better-auth.user",
        refId: userId,
        field,
      },
      files: file,
    });

  return uploaded as { url: string };
}

/**
 * Removes a previously uploaded file from the media library, but only if
 * the caller is allowed to: either they're the user it's directly
 * related to (via `uploadOwnedFile` — true for avatars, and briefly true
 * for logos before they're attached to an org), or the file is related
 * to an organization and they're an owner/admin of that org (true for
 * logos once `relinkOrganizationLogo` in `lib/auth.ts` re-tags them).
 */
export async function deleteOwnedFile({
  userId,
  url,
  headers,
}: {
  userId: string | number;
  url: string;
  headers: Headers;
}) {
  const existing = await strapi.db.query("plugin::upload.file").findOne({
    where: { url },
    populate: ["related"],
  });
  if (!existing) return false;

  const related =
    (existing.related as { id: string | number; __type: string }[]) ?? [];

  const isOwnFile = related.some(
    (item) =>
      item.__type === "plugin::better-auth.user" &&
      String(item.id) === String(userId),
  );

  const relatedOrganization = related.find(
    (item) => item.__type === "plugin::better-auth.organization",
  );

  const canManageRelatedOrganization =
    relatedOrganization &&
    (
      await auth.api.hasPermission({
        headers,
        body: {
          organizationId: String(relatedOrganization.id),
          permissions: { organization: ["update"] },
        },
      })
    ).success;

  if (!isOwnFile && !canManageRelatedOrganization) return false;

  await strapi.plugin("upload").service("upload").remove(existing);
  return true;
}

import { APIError } from "better-auth/api";

export const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

/**
 * better-auth resolves relative redirect params against its own base URL
 * (the CMS), so make them absolute on the web app instead — including the
 * error/new-user variants, which it redirects to with `?error=<code>`.
 */
export function absolutizeCallbackURL(url: string): string {
  const parsed = new URL(url);
  for (const param of [
    "callbackURL",
    "errorCallbackURL",
    "newUserCallbackURL",
  ]) {
    const value = parsed.searchParams.get(param);
    if (value && !/^https?:\/\//i.test(value)) {
      parsed.searchParams.set(
        param,
        new URL(value, process.env.WEBSITE_URL).toString(),
      );
    }
  }
  return parsed.toString();
}

export function absolutizeMediaUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `${STRAPI_URL}${url}`;
}

/**
 * The `dash` plugin authenticates its dashboard-integration requests by
 * hashing this key (see `@better-auth/infra`'s dash plugin) — falling back to
 * a checked-in default would mean anyone reading this (now-public) source
 * could compute a valid hash if the env var was ever left unset in a real
 * deployment. Fail closed instead.
 */
export function requireDashboardSecret(): string {
  const secret = process.env.BETTER_AUTH_DASHBOARD_SECRET;
  if (!secret) {
    throw new Error(
      "BETTER_AUTH_DASHBOARD_SECRET must be set (no insecure default is used).",
    );
  }
  return secret;
}

/**
 * Guards the `logo` an organization is created/updated with. If the URL
 * points at a file in our media library, that file must belong to the acting
 * user (a fresh `uploadOwnedFile` upload) or already to this organization —
 * otherwise `relinkOrganizationLogo` would re-tag someone else's file (another
 * user's avatar, a package icon, …) to this org, detaching it from its real
 * owner and letting `DELETE /organizations/logo` remove it. URLs that match no
 * file have nothing to hijack and pass.
 */
export async function assertLogoUsable(
  logo: string | null | undefined,
  userId: string | number,
  organizationId?: string | number,
) {
  if (!logo) return;

  const file = await strapi.db.query("plugin::upload.file").findOne({
    where: { url: logo },
    populate: ["related"],
  });
  if (!file) return;

  const related =
    (file.related as { id: string | number; __type: string }[]) ?? [];
  const usable =
    related.length > 0 &&
    related.every(
      (item) =>
        (item.__type === "plugin::better-auth.user" &&
          String(item.id) === String(userId)) ||
        (organizationId !== undefined &&
          item.__type === "plugin::better-auth.organization" &&
          String(item.id) === String(organizationId)),
    );

  if (!usable) {
    throw new APIError("BAD_REQUEST", { message: "Invalid logo." });
  }
}

/**
 * Re-links an uploaded logo file's `related` (the native polymorphic field on
 * `plugin::upload.file`) to the organization it now belongs to.
 *
 * At upload time (`uploadOwnedFile` in the better-auth extension), the file can
 * only be tagged to the *uploading user* — better-auth-ui's
 * `organization.logo.upload` callback has no organization id, since the logo
 * isn't attached to an org until the update call. Once it is, this re-tags the
 * file so it's correctly related to the organization instead. Runs on every
 * organization update (not just logo changes), which is harmless — it's a
 * no-op when there's no logo, and idempotent when the logo didn't change.
 */
export async function relinkOrganizationLogo(organization: {
  id: string | number;
  logo?: string | null;
}) {
  if (!organization.logo) return;

  await strapi.db.query("plugin::upload.file").update({
    where: { url: organization.logo },
    data: {
      related: [
        {
          id: organization.id,
          __type: "plugin::better-auth.organization",
          __pivot: { field: "logo" },
        },
      ],
    },
  });
}

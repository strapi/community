const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;

/**
 * GET /api/impersonation/allowed — whether the current viewer may impersonate
 * (an owner/admin of the Strapi team org). Backs the "Impersonate" button's
 * visibility only; the real enforcement is server-side (the admin plugin's
 * `adminUserIds` — see `apps/cms/src/lib/auth.ts`). The org id stays on the
 * CMS; this endpoint just returns a boolean. Called with the browser's
 * better-auth session cookie, and only once a session is known to exist (the
 * endpoint requires auth), mirroring `canEditSubmission`.
 */
export async function canImpersonate(): Promise<boolean> {
  try {
    const res = await fetch(`${CMS_URL}/api/impersonation/allowed`, {
      credentials: "include",
    });
    if (!res.ok) return false;
    const { allowed } = (await res.json()) as { allowed?: boolean };
    return Boolean(allowed);
  } catch {
    return false;
  }
}

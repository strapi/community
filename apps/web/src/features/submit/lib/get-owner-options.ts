const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;

export type ManageableOrganization = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
};

/**
 * GET /api/organizations/mine — organizations the signed-in user is an
 * owner/admin of, i.e. allowed to submit on behalf of. Backs the "Submit
 * as" selector on the plugin/template submission forms. Called with the
 * browser's better-auth session cookie, same pattern as
 * `features/submissions/lib/submission-edit.ts`.
 */
export async function getManageableOrganizations(): Promise<
  ManageableOrganization[]
> {
  try {
    const res = await fetch(`${CMS_URL}/api/organizations/mine`, {
      credentials: "include",
    });
    if (!res.ok) return [];
    return (await res.json()) as ManageableOrganization[];
  } catch {
    return [];
  }
}

import { toast } from "sonner";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;

export type OrganizationProfile = {
  bio?: string | null;
  subtitle?: string | null;
  website?: string | null;
  github?: string | null;
  location?: string | null;
  readme?: string | null;
};

async function extractErrorMessage(res: Response, fallback: string) {
  const body = await res.json().catch(() => null);
  return (body?.error?.message as string | undefined) || fallback;
}

export async function updateOrganizationProfile(
  organizationId: string,
  data: OrganizationProfile,
): Promise<OrganizationProfile | undefined> {
  try {
    const res = await fetch(
      `${CMS_URL}/api/organizations/${organizationId}/profile`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    if (!res.ok) {
      throw new Error(
        await extractErrorMessage(
          res,
          "Failed to update organization profile.",
        ),
      );
    }

    return (await res.json()) as OrganizationProfile;
  } catch (error) {
    console.error("Organization profile update failed:", error);
    toast.error(
      error instanceof Error
        ? error.message
        : "Failed to update organization profile.",
    );
    return undefined;
  }
}

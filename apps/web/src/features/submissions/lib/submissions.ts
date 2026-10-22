import { toast } from "sonner";
import type { SubmissionsResponse } from "./types";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;

async function extractErrorMessage(res: Response, fallback: string) {
  const body = await res.json().catch(() => null);
  return (body?.error?.message as string | undefined) || fallback;
}

/** GET /users/me/submissions — the personal "Submissions" tab's list. */
export async function getUserSubmissions(): Promise<
  SubmissionsResponse | undefined
> {
  try {
    const res = await fetch(`${CMS_URL}/api/users/me/submissions`, {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(
        await extractErrorMessage(res, "Failed to load your submissions."),
      );
    }

    return (await res.json()) as SubmissionsResponse;
  } catch (error) {
    console.error("Submissions fetch failed:", error);
    toast.error(
      error instanceof Error
        ? error.message
        : "Failed to load your submissions.",
    );
    return undefined;
  }
}

/** GET /organizations/:id/submissions — the organization "Submissions" tab's list. */
export async function getOrganizationSubmissions(
  organizationId: string,
): Promise<SubmissionsResponse | undefined> {
  try {
    const res = await fetch(
      `${CMS_URL}/api/organizations/${organizationId}/submissions`,
      { credentials: "include" },
    );

    if (!res.ok) {
      throw new Error(
        await extractErrorMessage(res, "Failed to load submissions."),
      );
    }

    return (await res.json()) as SubmissionsResponse;
  } catch (error) {
    console.error("Organization submissions fetch failed:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to load submissions.",
    );
    return undefined;
  }
}

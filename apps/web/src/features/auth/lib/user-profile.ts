import { toast } from "sonner";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;

export type UserProfile = {
  bio?: string | null;
  subtitle?: string | null;
  website?: string | null;
  github?: string | null;
  location?: string | null;
  email?: string | null;
  readme?: string | null;
};

async function extractErrorMessage(res: Response, fallback: string) {
  const body = await res.json().catch(() => null);
  return (body?.error?.message as string | undefined) || fallback;
}

export async function getUserProfile(): Promise<UserProfile | undefined> {
  try {
    const res = await fetch(`${CMS_URL}/api/users/me/profile`, {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(
        await extractErrorMessage(res, "Failed to load profile."),
      );
    }

    return (await res.json()) as UserProfile;
  } catch (error) {
    console.error("Profile fetch failed:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to load profile.",
    );
    return undefined;
  }
}

export async function updateUserProfile(
  data: UserProfile,
): Promise<UserProfile | undefined> {
  try {
    const res = await fetch(`${CMS_URL}/api/users/me/profile`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(
        await extractErrorMessage(res, "Failed to update profile."),
      );
    }

    return (await res.json()) as UserProfile;
  } catch (error) {
    console.error("Profile update failed:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to update profile.",
    );
    return undefined;
  }
}

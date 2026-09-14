import { toast } from "sonner";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;

async function extractErrorMessage(res: Response, fallback: string) {
  const body = await res.json().catch(() => null);
  return (body?.error?.message as string | undefined) || fallback;
}

export async function uploadOrganizationLogo(
  file: File,
): Promise<string | undefined> {
  try {
    const form = new FormData();
    form.append("file", file, file.name);

    const res = await fetch(`${CMS_URL}/api/organizations/logo`, {
      method: "POST",
      credentials: "include",
      body: form,
    });

    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, "Failed to upload logo."));
    }

    const data = (await res.json()) as { url: string };
    return data.url;
  } catch (error) {
    console.error("Organization logo upload failed:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to upload logo.",
    );
    return undefined;
  }
}

export async function deleteOrganizationLogo(url: string): Promise<void> {
  try {
    const res = await fetch(`${CMS_URL}/api/organizations/logo`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      throw new Error(
        await extractErrorMessage(res, "Failed to delete old logo."),
      );
    }
  } catch (error) {
    console.error("Organization logo cleanup failed:", error);
  }
}

import "server-only";

import { sanitizeIfSvg } from "./sanitize-svg";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? "http://localhost:1337";
const CMS_BEARER_TOKEN = process.env.CMS_BEARER_TOKEN;

export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
  "image/gif",
];
export const MAX_LOGO_SIZE = 2 * 1024 * 1024;

export function str(value: FormDataEntryValue | null): string | null {
  if (!value || typeof value !== "string") return null;
  const t = value.trim();
  return t.length > 0 ? t : null;
}

export function parseCategories(raw: FormDataEntryValue | null): string[] {
  try {
    if (typeof raw === "string" && raw) return JSON.parse(raw) as string[];
  } catch {}
  return [];
}

export async function uploadImageToStrapi(
  file: File,
  logPrefix: string,
): Promise<string | null> {
  const safeFile = await sanitizeIfSvg(file);
  const form = new FormData();
  form.append("files", safeFile, safeFile.name);

  try {
    const res = await fetch(`${CMS_URL}/api/upload`, {
      method: "POST",
      headers: CMS_BEARER_TOKEN
        ? { Authorization: `Bearer ${CMS_BEARER_TOKEN}` }
        : {},
      body: form,
    });
    if (!res.ok) {
      console.error(`[${logPrefix}] Image upload failed: ${res.status}`);
      return null;
    }
    const data = (await res.json()) as Array<{ documentId: string }>;
    return data[0]?.documentId ?? null;
  } catch (err) {
    console.error(`[${logPrefix}] Image upload error:`, err);
    return null;
  }
}

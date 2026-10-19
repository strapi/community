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

/**
 * Syncing is the default (same as the edit form) — the submitted readme
 * is only kept when the submitter opted to edit it manually; otherwise
 * the package-info cron fills it from the registry/repository.
 */
export function readmeFields(formData: FormData) {
  const readme_auto_sync = formData.get("readme_auto_sync") !== "false";
  return {
    readme_auto_sync,
    readme: readme_auto_sync ? null : str(formData.get("readme")),
  };
}

/**
 * Uploads to the CMS media library and returns the file's numeric `id` —
 * media fields are linked by `id`, not `documentId` (a `{ documentId }`
 * value on a media field is silently dropped by the document service).
 */
export async function uploadImageToStrapi(
  file: File,
  logPrefix: string,
): Promise<number | null> {
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
    const data = (await res.json()) as Array<{ id: number }>;
    return data[0]?.id ?? null;
  } catch (err) {
    console.error(`[${logPrefix}] Image upload error:`, err);
    return null;
  }
}

import { toast } from "sonner";
import type {
  OwnerType,
  PickerResult,
  SubmissionDetail,
  SubmissionType,
} from "./types";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;

const PLURAL: Record<SubmissionType, string> = {
  package: "packages",
  template: "templates",
};

async function extractErrorMessage(res: Response, fallback: string) {
  const body = await res.json().catch(() => null);
  return (body?.error?.message as string | undefined) || fallback;
}

/**
 * GET /packages/:documentId/submission (or the template equivalent) — the
 * edit form's data source. Visible to the owner and to maintainers
 * (read-only); the response's `isOwner` says which.
 */
export async function getSubmission(
  type: SubmissionType,
  documentId: string,
): Promise<SubmissionDetail | undefined> {
  try {
    const res = await fetch(
      `${CMS_URL}/api/${PLURAL[type]}/${documentId}/submission`,
      { credentials: "include" },
    );

    if (!res.ok) {
      throw new Error(
        await extractErrorMessage(res, "Failed to load submission."),
      );
    }

    return (await res.json()) as SubmissionDetail;
  } catch (error) {
    console.error("Submission fetch failed:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to load submission.",
    );
    return undefined;
  }
}

export type SubmissionUpdateData = {
  name?: string;
  description?: string;
  categories?: string[];
  maintainers?: string[];
  readme?: string;
  readme_auto_sync?: boolean;
  /** Templates only. */
  preview_link?: string;
};

/**
 * PUT /packages/:id (or the template equivalent) — the core content-api
 * `update` route, reused here (see the package/template controller
 * overrides for the server-side field whitelist and read-only-field
 * guard). `categories`/`maintainers` are documentIds, not names — unlike
 * the public submit form, this writes the relation directly.
 */
export async function updateSubmission(
  type: SubmissionType,
  documentId: string,
  data: SubmissionUpdateData,
): Promise<SubmissionDetail | undefined> {
  try {
    const res = await fetch(`${CMS_URL}/api/${PLURAL[type]}/${documentId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });

    if (!res.ok) {
      throw new Error(
        await extractErrorMessage(res, "Failed to save changes."),
      );
    }

    const body = (await res.json()) as { data?: SubmissionDetail };
    return body.data ?? (body as unknown as SubmissionDetail);
  } catch (error) {
    console.error("Submission update failed:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to save changes.",
    );
    return undefined;
  }
}

/**
 * POST /packages/:documentId/icon (or the template
 * `.../preview-image` equivalent) — replaces the logo/preview image
 * directly, outside the plain-field `update` route.
 */
export async function uploadSubmissionImage(
  type: SubmissionType,
  documentId: string,
  file: File,
): Promise<string | undefined> {
  try {
    const path = type === "package" ? "icon" : "preview-image";
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(
      `${CMS_URL}/api/${PLURAL[type]}/${documentId}/${path}`,
      { method: "POST", credentials: "include", body: form },
    );

    if (!res.ok) {
      throw new Error(
        await extractErrorMessage(res, "Failed to upload image."),
      );
    }

    const body = (await res.json()) as { url: string };
    return body.url;
  } catch (error) {
    console.error("Image upload failed:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to upload image.",
    );
    return undefined;
  }
}

/**
 * POST /packages/:documentId/transfer (or the template equivalent) —
 * immediate, no acceptance flow.
 */
export async function transferSubmission(
  type: SubmissionType,
  documentId: string,
  ownerDocumentId: string,
  ownerType: OwnerType,
): Promise<boolean> {
  try {
    const res = await fetch(
      `${CMS_URL}/api/${PLURAL[type]}/${documentId}/transfer`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerDocumentId, ownerType }),
      },
    );

    if (!res.ok) {
      throw new Error(
        await extractErrorMessage(res, "Failed to transfer ownership."),
      );
    }

    return true;
  } catch (error) {
    console.error("Transfer failed:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to transfer ownership.",
    );
    return false;
  }
}

/** DELETE /packages/:documentId/submission (or the template equivalent). */
export async function deleteSubmission(
  type: SubmissionType,
  documentId: string,
): Promise<boolean> {
  try {
    const res = await fetch(
      `${CMS_URL}/api/${PLURAL[type]}/${documentId}/submission`,
      { method: "DELETE", credentials: "include" },
    );

    if (!res.ok) {
      throw new Error(
        await extractErrorMessage(res, "Failed to delete submission."),
      );
    }

    return true;
  } catch (error) {
    console.error("Delete failed:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to delete submission.",
    );
    return false;
  }
}

/**
 * GET /user-by-slug?slug= — backs the maintainer picker and the
 * transfer-to-a-user picker. An exact, single-result lookup by slug (no
 * autocomplete/search-as-you-type, and never matched on name or email) —
 * the caller must already know the exact slug, same as visiting
 * `/<slug>` directly.
 */
export async function findUserBySlug(
  slug: string,
): Promise<PickerResult | undefined> {
  try {
    const res = await fetch(
      `${CMS_URL}/api/user-by-slug?slug=${encodeURIComponent(slug)}`,
      { credentials: "include" },
    );
    if (!res.ok) return undefined;
    const body = (await res.json()) as { data: PickerResult | null };
    return body.data ?? undefined;
  } catch (error) {
    console.error("User lookup failed:", error);
    return undefined;
  }
}

/** GET /organization-by-slug?slug= — backs the transfer-to-an-organization picker. */
export async function findOrganizationBySlug(
  slug: string,
): Promise<PickerResult | undefined> {
  try {
    const res = await fetch(
      `${CMS_URL}/api/organization-by-slug?slug=${encodeURIComponent(slug)}`,
      { credentials: "include" },
    );
    if (!res.ok) return undefined;
    const body = (await res.json()) as { data: PickerResult | null };
    return body.data ?? undefined;
  } catch (error) {
    console.error("Organization lookup failed:", error);
    return undefined;
  }
}

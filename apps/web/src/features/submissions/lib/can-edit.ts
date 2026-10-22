import type { OwnerType, SubmissionType } from "./types";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;

const PLURAL: Record<SubmissionType, string> = {
  package: "packages",
  template: "templates",
};

export type CanEditResult = {
  canEdit: boolean;
  ownerType: OwnerType | null;
  ownerSlug: string | null;
};

const FALLBACK: CanEditResult = {
  canEdit: false,
  ownerType: null,
  ownerSlug: null,
};

/**
 * GET /packages/:documentId/can-edit (or the template equivalent) — backs
 * the "Edit" button on the public package/template page. Deliberately
 * cheap (no relations/readme populated) compared to
 * `submission-edit.ts`'s `getSubmission`, since this fires on every page
 * view for a logged-in viewer — only call it once the caller already
 * knows a session exists (the endpoint itself still requires auth, so an
 * anonymous call would just 401 needlessly).
 */
export async function canEditSubmission(
  type: SubmissionType,
  documentId: string,
): Promise<CanEditResult> {
  try {
    const res = await fetch(
      `${CMS_URL}/api/${PLURAL[type]}/${documentId}/can-edit`,
      { credentials: "include" },
    );
    if (!res.ok) return FALLBACK;
    return (await res.json()) as CanEditResult;
  } catch (error) {
    console.error("can-edit check failed:", error);
    return FALLBACK;
  }
}

/**
 * Which settings shell the edit form should open inside — personal
 * `/account/...` for a user-owned entry, or the owning org's
 * `/org/<slug>/...` for an org-owned one (see account-view.tsx /
 * organization-view.tsx — the edit form itself works identically either
 * way, only the surrounding nav/"back" context differs).
 */
export function editHrefFor(
  type: SubmissionType,
  documentId: string,
  { ownerType, ownerSlug }: Pick<CanEditResult, "ownerType" | "ownerSlug">,
): string {
  if (ownerType === "plugin::better-auth.organization" && ownerSlug) {
    return `/org/${ownerSlug}/submissions/${type}/${documentId}/edit`;
  }
  return `/account/submissions/${type}/${documentId}/edit`;
}

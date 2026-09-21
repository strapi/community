const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;

export type SubmissionKind = "packages" | "templates";

/**
 * POST /api/moderation/:plural/submit — called directly from the browser
 * (not through a Next.js route) with the caller's better-auth session
 * cookie, same pattern as `updateSubmission`/`transferSubmission` in
 * `features/submissions/lib/submission-edit.ts`. `payload` carries
 * `owner_type`/`owner_id` (see the submit forms' "Submit as" selector) —
 * the CMS still derives the *submitter* from the session, but validates
 * that the chosen owner (if an organization) is one they administer.
 */
export async function createSubmission(
  kind: SubmissionKind,
  payload: Record<string, unknown>,
): Promise<{ documentId: string } | { error: string }> {
  try {
    const res = await fetch(`${CMS_URL}/api/moderation/${kind}/submit`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: payload }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        error:
          (body?.error?.message as string | undefined) ||
          "Submission failed. Please try again.",
      };
    }

    const body = (await res.json()) as { data: { documentId: string } };
    return { documentId: body.data.documentId };
  } catch {
    return { error: "Could not reach the server. Please try again later." };
  }
}

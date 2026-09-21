const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;

export type SubmissionKind = "packages" | "templates";

/**
 * POST /api/moderation/:plural/submit — called directly from the browser
 * (not through a Next.js route) with the caller's better-auth session
 * cookie, same pattern as `updateSubmission`/`transferSubmission` in
 * `features/submissions/lib/submission-edit.ts`. The CMS derives the
 * owner from that session, so there is no owner field to send here.
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

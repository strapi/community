"use client";

import { Button } from "@repo/strapi-ui";
import { PencilIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "@/features/auth/lib/client";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";
import { canEditSubmission, editHrefFor } from "../../lib/can-edit";
import type { SubmissionType } from "../../lib/types";

/**
 * "Edit" button on the public package/template page — visible only to
 * whoever is actually allowed to edit this content (the owner; maintainers
 * get read visibility elsewhere, never write access — see
 * `is-content-owner` on the CMS side). Renders nothing until the check
 * resolves in the caller's favor, and skips the check entirely for
 * anonymous visitors (the vast majority of page views) — `useSession()`
 * is already cheap/cached app-wide, so that short-circuit costs nothing.
 */
export function EditContentButton({
  type,
  documentId,
}: {
  type: SubmissionType;
  documentId: string;
}) {
  const { data: session, isPending } = authClient.useSession();
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthEnabled || isPending || !session?.user) return;

    let active = true;
    canEditSubmission(type, documentId).then((result) => {
      if (!active || !result.canEdit) return;
      setHref(editHrefFor(type, documentId, result));
    });

    return () => {
      active = false;
    };
  }, [isPending, session?.user, type, documentId]);

  if (!href) return null;

  return (
    <Button href={href} variant="secondary" size="sm">
      <PencilIcon className="h-4 w-4" />
      Edit
    </Button>
  );
}

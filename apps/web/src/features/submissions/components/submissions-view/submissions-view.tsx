"use client";

import { useEffect, useState } from "react";
import {
  getOrganizationSubmissions,
  getUserSubmissions,
} from "../../lib/submissions";
import type {
  SubmissionCategory,
  SubmissionsResponse,
  SubmissionType,
} from "../../lib/types";
import { SubmissionEditForm } from "../submission-edit-form/submission-edit-form";
import { SubmissionList } from "../submission-list/submission-list";

/**
 * The "Submissions" tab shared by `AccountView` and `OrganizationView` —
 * owns the list-vs-edit switch, driven by `editTarget` (parsed from the URL
 * by the caller, since the shared tab-catch-all only natively resolves one
 * flat path segment — see the routing change in account-view.tsx /
 * organization-view.tsx).
 */
export function SubmissionsView({
  variant,
  organizationId,
  editTarget,
  backHref,
  editHrefFor,
  packageCategories,
  templateCategories,
}: {
  variant: "user" | "organization";
  organizationId?: string;
  editTarget?: { type: SubmissionType; documentId: string };
  backHref: string;
  editHrefFor: (type: SubmissionType, documentId: string) => string;
  packageCategories: SubmissionCategory[];
  templateCategories: SubmissionCategory[];
}) {
  const [data, setData] = useState<SubmissionsResponse | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (editTarget) return;

    let active = true;
    setLoading(true);

    const fetchList =
      variant === "organization" && organizationId
        ? () => getOrganizationSubmissions(organizationId)
        : getUserSubmissions;

    fetchList().then((result) => {
      if (!active) return;
      setData(result);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [variant, organizationId, editTarget]);

  if (editTarget) {
    return (
      <SubmissionEditForm
        type={editTarget.type}
        documentId={editTarget.documentId}
        allCategories={
          editTarget.type === "package" ? packageCategories : templateCategories
        }
        backHref={backHref}
      />
    );
  }

  if (variant === "organization" && !organizationId) return null;

  if (loading) {
    return (
      <div className="rounded-md border border-(--color-neutral150) bg-white p-6 text-sm text-(--color-neutral600)">
        Loading…
      </div>
    );
  }

  return (
    <SubmissionList
      packages={data?.packages ?? []}
      templates={data?.templates ?? []}
      editHrefFor={editHrefFor}
    />
  );
}

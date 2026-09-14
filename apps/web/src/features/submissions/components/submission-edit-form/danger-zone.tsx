"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  deleteSubmission,
  transferSubmission,
} from "../../lib/submission-edit";
import type { SubmissionType } from "../../lib/types";
import { OwnerPicker, type PickedOwner } from "../owner-picker/owner-picker";

/**
 * Transfer ownership (to any user or org, immediate — no acceptance flow)
 * or delete entirely, each behind a `ConfirmDialog`. Only ever rendered
 * for the owner — see `submission-edit-form.tsx`, which hides this whole
 * section when `isOwner` is false; the write is also rejected server-side
 * for anyone else regardless (`is-content-owner`).
 */
export function DangerZone({
  type,
  documentId,
  name,
  backHref,
}: {
  type: SubmissionType;
  documentId: string;
  name: string;
  backHref: string;
}) {
  const router = useRouter();
  const [owner, setOwner] = useState<PickedOwner | null>(null);
  const [confirmName, setConfirmName] = useState("");

  const handleTransfer = async () => {
    if (!owner) return;
    const ok = await transferSubmission(
      type,
      documentId,
      owner.documentId,
      owner.type,
    );
    if (ok) {
      toast.success(`Ownership transferred to ${owner.name}.`);
      setOwner(null);
      router.push(backHref);
      router.refresh();
    }
  };

  const handleDelete = async () => {
    const ok = await deleteSubmission(type, documentId);
    if (ok) {
      toast.success("Submission deleted.");
      router.push(backHref);
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-md border border-red-200 bg-red-50 p-6">
      <div>
        <h3 className="text-sm font-semibold text-red-700">Danger zone</h3>
        <p className="text-sm text-red-700/80">
          These actions are immediate and cannot be undone.
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t border-red-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-(--color-neutral900)">
            Transfer ownership
          </p>
          <p className="text-xs text-(--color-neutral600)">
            Move this {type} to another user or organization — takes effect
            immediately.
          </p>
        </div>
        <ConfirmDialog
          trigger={
            <button
              type="button"
              className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Transfer…
            </button>
          }
          title="Transfer ownership"
          description={`Choose who should own "${name}" from now on. This happens immediately — the new owner isn't asked to accept.`}
          confirmLabel="Transfer"
          confirmDisabled={!owner}
          destructive
          onConfirm={handleTransfer}
        >
          <OwnerPicker value={owner} onChange={setOwner} />
        </ConfirmDialog>
      </div>

      <div className="flex flex-col gap-2 border-t border-red-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-(--color-neutral900)">
            Delete {type}
          </p>
          <p className="text-xs text-(--color-neutral600)">
            Permanently deletes "{name}" and everything attached to it.
          </p>
        </div>
        <ConfirmDialog
          trigger={
            <button
              type="button"
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Delete…
            </button>
          }
          title={`Delete "${name}"?`}
          description="This permanently deletes the submission. This cannot be undone."
          confirmLabel="Delete permanently"
          confirmDisabled={confirmName.trim() !== name}
          destructive
          onConfirm={handleDelete}
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirm_delete_name"
              className="text-xs text-(--color-neutral600)"
            >
              Type <span className="font-semibold">{name}</span> to confirm.
            </label>
            <Input
              id="confirm_delete_name"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
            />
          </div>
        </ConfirmDialog>
      </div>
    </div>
  );
}

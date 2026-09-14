"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A generic "are you sure?" dialog for destructive/consequential actions
 * (delete, transfer, …) — no existing `Dialog` wrapper was in
 * `components/ui/` to build on, so this is a new one, matching the same
 * radix-wrapper conventions as `select.tsx`/`checkbox.tsx` in this folder.
 * Pass `children` for extra content inside the dialog body, e.g. a
 * type-to-confirm input — gate `confirmDisabled` off its value.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  confirmDisabled,
  destructive,
  onConfirm,
  children,
}: {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  confirmDisabled?: boolean;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => !busy && setOpen(next)}
    >
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-(--color-neutral150) bg-white p-6 shadow-lg focus:outline-none">
          <DialogPrimitive.Title className="text-base font-semibold text-(--color-neutral900)">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 text-sm text-(--color-neutral600)">
            {description}
          </DialogPrimitive.Description>

          {children && <div className="mt-4">{children}</div>}

          <div className="mt-6 flex justify-end gap-2">
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                disabled={busy}
                className="rounded-md border border-(--color-neutral150) px-4 py-2 text-sm font-medium text-(--color-neutral700) disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </DialogPrimitive.Close>
            <button
              type="button"
              disabled={confirmDisabled || busy}
              onClick={handleConfirm}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50",
                destructive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-(--color-primary600)",
              )}
            >
              {busy ? "Please wait…" : confirmLabel}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

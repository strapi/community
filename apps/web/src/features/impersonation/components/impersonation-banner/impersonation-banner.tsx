"use client";

import { Button } from "@repo/strapi-ui";
import { UserCog } from "lucide-react";
import { useImpersonation } from "../../lib/use-impersonation";

/**
 * Persistent bottom bar shown whenever the current session is an
 * impersonation session (`session.impersonatedBy` is set). Gives the admin a
 * constant reminder that they're acting as someone else and a one-click way
 * out. Mounted once, globally (see the root layout); renders nothing when not
 * impersonating, so it's inert for normal sessions.
 */
export function ImpersonationBanner() {
  const { isImpersonating, currentName, isBusy, stop } = useImpersonation();

  if (!isImpersonating) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-amber-500 bg-amber-100 px-4 py-3 text-amber-950 shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        <UserCog className="h-4 w-4 shrink-0" />
        You are impersonating
        {currentName ? <strong>{currentName}</strong> : <strong>a user</strong>}
        .
      </span>
      <Button
        type="button"
        variant="secondary"
        size="xs"
        disabled={isBusy}
        onClick={() => stop()}
      >
        {isBusy ? "Stopping…" : "Stop impersonating"}
      </Button>
    </div>
  );
}

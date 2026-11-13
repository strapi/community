"use client";

import { Button } from "@repo/strapi-ui";
import { UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "@/features/auth/lib/client";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";
import { canImpersonate } from "../../lib/can-impersonate";
import { useImpersonation } from "../../lib/use-impersonation";

/**
 * "Impersonate" action on a public user profile. Visible only to signed-in
 * owners/admins of the Strapi team org (checked server-side via
 * `canImpersonate`), and never on your own profile or while already
 * impersonating — so it renders nothing for the vast majority of visitors.
 * The check is skipped entirely for anonymous viewers, like
 * `EditContentButton` does.
 */
export function ImpersonateButton({
  userId,
  userName,
}: {
  userId: string | number;
  userName?: string | null;
}) {
  const { isImpersonating, currentUserId, isBusy, impersonate } =
    useImpersonation();
  const { data: session, isPending } = authClient.useSession();
  const [allowed, setAllowed] = useState(false);

  const isSelf =
    currentUserId !== undefined && String(currentUserId) === String(userId);

  useEffect(() => {
    if (!isAuthEnabled || isPending || !session?.user || isImpersonating) {
      setAllowed(false);
      return;
    }

    let active = true;
    canImpersonate().then((ok) => {
      if (active) setAllowed(ok);
    });

    return () => {
      active = false;
    };
  }, [isPending, session?.user, isImpersonating]);

  if (!allowed || isSelf) return null;

  return (
    <Button
      type="button"
      variant="outlineInverse"
      size="sm"
      disabled={isBusy}
      onClick={() => impersonate(userId)}
    >
      <UserCog className="h-4 w-4" />
      {isBusy
        ? "Starting…"
        : `Impersonate${userName ? ` ${userName}` : " user"}`}
    </Button>
  );
}

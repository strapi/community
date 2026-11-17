"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/features/auth/lib/client";

/**
 * The shared `authClient` is annotated with `ReturnType<typeof
 * createAuthClient>` to keep its type nameable/serializable — the full
 * better-auth plugin inference overflows tsc (see
 * `features/auth/lib/client.ts`). That annotation collapses the client to
 * its base shape, erasing the per-plugin method/field types, so the few
 * admin-plugin bits this feature touches are typed by hand here.
 */

type AdminActionResult = { error: { message?: string | null } | null };

type AdminApi = {
  impersonateUser: (opts: { userId: string }) => Promise<AdminActionResult>;
  stopImpersonating: () => Promise<AdminActionResult>;
};

/** The admin-plugin fields the base session type doesn't surface. */
type SessionWithAdminFields = {
  user?: { id?: string | number; name?: string | null };
  session?: { impersonatedBy?: string | null };
} | null;

function adminApi(): AdminApi {
  return (authClient as unknown as { admin: AdminApi }).admin;
}

export type UseImpersonation = {
  /** True while the current session is an impersonation session. */
  isImpersonating: boolean;
  /** Display name of whoever is currently signed in (the impersonated user). */
  currentName: string | null;
  /** The signed-in user's better-auth id (the impersonated user while active). */
  currentUserId: string | number | undefined;
  /** Whether a start/stop request is in flight. */
  isBusy: boolean;
  /** Start impersonating the given better-auth user id. */
  impersonate: (userId: string | number) => Promise<void>;
  /** End the active impersonation session. */
  stop: () => Promise<void>;
};

export function useImpersonation(): UseImpersonation {
  const { data } = authClient.useSession();
  const session = data as SessionWithAdminFields;
  const [isBusy, setIsBusy] = useState(false);

  async function run(action: () => Promise<AdminActionResult>) {
    setIsBusy(true);
    try {
      const { error } = await action();
      if (error) {
        toast.error(error.message ?? "Something went wrong.");
        setIsBusy(false);
        return;
      }
      // Impersonating (and stopping) swaps the session cookie; a full reload
      // is the simplest way to re-render every server component as the new
      // identity rather than reconciling client caches by hand. Leave
      // `isBusy` set so the control stays disabled until the reload lands.
      window.location.assign("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setIsBusy(false);
    }
  }

  return {
    isImpersonating: Boolean(session?.session?.impersonatedBy),
    currentName: session?.user?.name ?? null,
    currentUserId: session?.user?.id,
    isBusy,
    impersonate: (userId) =>
      run(() => adminApi().impersonateUser({ userId: String(userId) })),
    stop: () => run(() => adminApi().stopImpersonating()),
  };
}

"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/features/auth/lib/client";
import { getContributionsEligibility } from "./dashboard";

/**
 * Whether the signed-in user has a "Community points" section — everyone but
 * current and former Strapi employees (decided by the CMS). Refetched
 * whenever the session's user changes (sign-in, sign-out, account
 * switch); `false` while unknown, so nothing flashes in for employees.
 */
export function useContributionsEligibility() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const userId = session?.user?.id;

  const [state, setState] = useState<{ userId?: string; eligible: boolean }>({
    eligible: false,
  });

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    getContributionsEligibility()
      .then(({ eligible }) => !cancelled && setState({ userId, eligible }))
      .catch(() => !cancelled && setState({ userId, eligible: false }));

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isCurrent = !!userId && state.userId === userId;

  return {
    eligible: isCurrent && state.eligible,
    isPending: sessionPending || (!!userId && !isCurrent),
  };
}

"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/features/auth/lib/client";
import type { PartnerLevel } from "./levels";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;

export type PartnerOrganization = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  /** Empty means "Unlisted". */
  partner_level: Exclude<PartnerLevel, "Unlisted"> | null;
  createdAt: string;
  profile: { website?: string | null; location?: string | null } | null;
};

/**
 * GET /api/organizations/partners — partner organizations the signed-in
 * user is an owner/admin of, i.e. whose partner portal they can open.
 * Called with the browser's better-auth session cookie, same pattern as
 * `features/submit/lib/get-owner-options.ts`.
 */
export async function getPartnerOrganizations(): Promise<
  PartnerOrganization[]
> {
  try {
    const res = await fetch(`${CMS_URL}/api/organizations/partners`, {
      credentials: "include",
    });
    if (!res.ok) return [];
    return (await res.json()) as PartnerOrganization[];
  } catch {
    return [];
  }
}

/**
 * The signed-in user's partner organizations, refetched whenever the
 * session's user changes (sign-in, sign-out, account switch).
 */
export function usePartnerOrganizations() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const userId = session?.user?.id;

  const [state, setState] = useState<{
    userId?: string;
    organizations: PartnerOrganization[];
  }>({ organizations: [] });

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    getPartnerOrganizations().then((organizations) => {
      if (!cancelled) setState({ userId, organizations });
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isCurrent = !!userId && state.userId === userId;

  return {
    organizations: isCurrent ? state.organizations : [],
    isPending: sessionPending || (!!userId && !isCurrent),
  };
}

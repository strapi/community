"use client";

import { useEffect, useState } from "react";
import type { PartnerLevel, PartnerSection } from "./levels";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;

export type PartnerBenefit = {
  id: number;
  level: PartnerLevel;
  title: string;
  description: string | null;
};

export type PartnerResource = {
  documentId: string;
  title: string;
  slug: string;
  description: string | null;
  section: PartnerSection;
  minimum_level: PartnerLevel;
  category: string | null;
  label: string | null;
  icon: string | null;
  link: string | null;
  file: { url: string; name: string; ext: string; size: number } | null;
};

export type PartnerResourceSummary = PartnerResource & {
  has_content: boolean;
};

export type PartnerPortalContent = {
  level: PartnerLevel;
  benefits: PartnerBenefit[];
  resources: PartnerResourceSummary[];
};

/**
 * GET /api/organizations/:id/partner-portal — the portal's gated content,
 * already filtered by the organization's partner level. Owners/admins
 * only, called with the browser's better-auth session cookie.
 */
async function getPartnerPortal(
  organizationId: number,
): Promise<PartnerPortalContent | null> {
  try {
    const res = await fetch(
      `${CMS_URL}/api/organizations/${organizationId}/partner-portal`,
      { credentials: "include" },
    );
    if (!res.ok) return null;
    return (await res.json()) as PartnerPortalContent;
  } catch {
    return null;
  }
}

/** GET /api/organizations/:id/partner-portal/resources/:slug — one resource, with its body. */
async function getPartnerResource(
  organizationId: number,
  slug: string,
): Promise<(PartnerResource & { content: string | null }) | null> {
  try {
    const res = await fetch(
      `${CMS_URL}/api/organizations/${organizationId}/partner-portal/resources/${encodeURIComponent(slug)}`,
      { credentials: "include" },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Loads `load()` whenever `key` changes, dropping stale results. */
function useLoader<T>(key: string | undefined, load: () => Promise<T>) {
  const [state, setState] = useState<{ key?: string; data?: T }>({});

  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` identifies `load`'s inputs.
  useEffect(() => {
    if (!key) return;

    let cancelled = false;
    load().then((data) => {
      if (!cancelled) setState({ key, data });
    });

    return () => {
      cancelled = true;
    };
  }, [key]);

  const isCurrent = !!key && state.key === key;

  return {
    data: isCurrent ? state.data : undefined,
    isPending: !isCurrent,
  };
}

export function usePartnerPortal(organizationId?: number) {
  return useLoader(
    organizationId != null ? String(organizationId) : undefined,
    () => getPartnerPortal(organizationId as number),
  );
}

export function usePartnerResource(organizationId: number, slug: string) {
  return useLoader(`${organizationId}/${slug}`, () =>
    getPartnerResource(organizationId, slug),
  );
}

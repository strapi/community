/**
 * Data access shared by the analytics tools. Keeping the queries here means the
 * `*_stats` and `*_graph` tools compute from exactly the same underlying rows.
 */
import type { Core, UID } from "@strapi/strapi";

// ─── Content types ───────────────────────────────────────────────────────────

export const SUBMISSION_TYPES = {
  plugin: "api::package.package",
  template: "api::template.template",
} as const satisfies Record<string, UID.ContentType>;

export type SubmissionType = keyof typeof SUBMISSION_TYPES;

/** `overall_status` enum, injected onto moderated content types by the moderation plugin. */
export const SUBMISSION_STATUSES = [
  "submitted",
  "under_review",
  "changes_requested",
  "rejected",
  "approved",
] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

const ORG_UID = "plugin::better-auth.organization" as UID.ContentType;
const MEMBER_UID = "plugin::better-auth.member" as UID.ContentType;

/** The better-auth organization role that denotes ownership. */
const OWNER_ROLE = "owner";

// ─── Paging ──────────────────────────────────────────────────────────────────

/**
 * Fetch every matching document, paging through results so we never silently
 * hit Strapi's default pagination cap. These collections are modest (a few
 * thousand rows at most), so loading them fully is fine.
 */
type DocRow = Record<string, unknown>;

async function findAll(
  strapi: Core.Strapi,
  uid: UID.ContentType,
  params: Record<string, unknown> = {},
): Promise<DocRow[]> {
  const pageSize = 1000;
  const all: DocRow[] = [];

  for (let page = 1; page <= 1000; page++) {
    // The document service is generic over `UID.ContentType`, so its `findMany`
    // params don't narrow to a known content type here; this call site passes a
    // plain params object deliberately.
    const documents = strapi.documents(uid) as {
      findMany: (p: Record<string, unknown>) => Promise<DocRow[]>;
    };
    const batch = await documents.findMany({
      ...params,
      pagination: { page, pageSize },
    });

    all.push(...batch);
    if (batch.length < pageSize) break;
  }

  return all;
}

// ─── Submissions ─────────────────────────────────────────────────────────────

export interface SubmissionRow {
  type: SubmissionType;
  status: SubmissionStatus | "unknown";
  createdAt: string;
}

/**
 * Every submitted package/template, regardless of publish state. We query the
 * `draft` version: a submission under review is an unpublished draft, and every
 * document has exactly one draft, so this counts each submission once.
 */
export async function fetchSubmissions(
  strapi: Core.Strapi,
  opts: { type?: SubmissionType | "all"; since?: string } = {},
): Promise<SubmissionRow[]> {
  const types =
    !opts.type || opts.type === "all"
      ? (Object.keys(SUBMISSION_TYPES) as SubmissionType[])
      : [opts.type];

  const rows: SubmissionRow[] = [];

  for (const type of types) {
    const entries = await findAll(strapi, SUBMISSION_TYPES[type], {
      status: "draft",
      fields: ["overall_status", "createdAt"],
      ...(opts.since ? { filters: { createdAt: { $gte: opts.since } } } : {}),
    });

    for (const entry of entries) {
      const status = entry.overall_status as
        | SubmissionStatus
        | null
        | undefined;
      rows.push({
        type,
        status:
          status && (SUBMISSION_STATUSES as readonly string[]).includes(status)
            ? status
            : "unknown",
        createdAt: entry.createdAt as string,
      });
    }
  }

  return rows;
}

// ─── Partner sign-ups ─────────────────────────────────────────────────────────

export type PartnerLevel =
  | "Enterprise"
  | "Business"
  | "Community"
  | "unspecified";

export interface PartnerRow {
  organizationId: number;
  name: string;
  level: PartnerLevel;
  /** When the partner organization itself was created. */
  createdAt: string;
  /**
   * When this partner first gained an owner, or `null` if it still has none.
   * A non-null value means the partner has "signed up": an owner was added to a
   * partner org that (necessarily) had none before — whether the org was created
   * with an owner or gained one later. This is the earliest owner-membership's
   * `createdAt`, which also dates the sign-up for the time series.
   */
  ownerSince: string | null;
}

/**
 * One row per partner organization (`partner: true`), annotated with when it
 * first got an owner (role `"owner"` in better-auth's organization membership).
 *
 * NOTE: this is derived from current state — there is no dedicated event log.
 * It therefore cannot see a partner that had its owner removed, nor confirm the
 * `partner` flag was already set at the exact moment the owner was first added.
 * For the "how many partners have an owner" question those edges don't matter;
 * precise event attribution would need lifecycle hooks writing to an audit table.
 */
export async function fetchPartners(
  strapi: Core.Strapi,
): Promise<PartnerRow[]> {
  const partners = await findAll(strapi, ORG_UID, {
    filters: { partner: true },
    fields: ["name", "partner_level", "createdAt"],
  });

  if (partners.length === 0) return [];

  const partnerIds = partners.map((p) => p.id);

  const owners = await findAll(strapi, MEMBER_UID, {
    filters: { role: OWNER_ROLE, organizationId: { $in: partnerIds } },
    fields: ["organizationId", "createdAt"],
  });

  // Earliest owner-membership per organization.
  const ownerSince = new Map<number, string>();
  for (const owner of owners) {
    const orgId = owner.organizationId as number;
    const createdAt = owner.createdAt as string;
    const current = ownerSince.get(orgId);
    if (!current || new Date(createdAt) < new Date(current)) {
      ownerSince.set(orgId, createdAt);
    }
  }

  return partners.map((p) => ({
    organizationId: p.id as number,
    name: p.name as string,
    level: (p.partner_level as PartnerLevel) ?? "unspecified",
    createdAt: p.createdAt as string,
    ownerSince: ownerSince.get(p.id as number) ?? null,
  }));
}

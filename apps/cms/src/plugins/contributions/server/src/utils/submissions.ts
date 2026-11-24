import type { Core } from "@strapi/strapi";
import {
  CONTRIBUTIONS_SINCE,
  type HubContributionCounts,
} from "./contributor-tiers";

const USER_OWNER_TYPE = "plugin::better-auth.user";

/** The Community Hub submissions that earn points, by table. */
export const SUBMISSION_TABLES = {
  "api::package.package": "packages",
  "api::template.template": "templates",
} as const;

export type SubmissionUid = keyof typeof SUBMISSION_TABLES;

/**
 * Plugins and templates the user owns personally (not through an
 * organization, and not ones they only maintain — anyone can be added as
 * a maintainer) that are published on the Community Hub, i.e. approved,
 * and were first submitted since `CONTRIBUTIONS_SINCE`. Database-only.
 */
export async function countPublishedSubmissions(
  strapi: Core.Strapi,
  userId: string | number,
): Promise<HubContributionCounts> {
  // A Date, so knex binds it right for each database (SQLite stores
  // timestamps as milliseconds, Postgres/MySQL as timestamps).
  const since = new Date(CONTRIBUTIONS_SINCE);

  const count = async (table: string) => {
    const [row] = await strapi.db
      .connection(table)
      .countDistinct({ count: "document_id" })
      .where({ owner_id: Number(userId), owner_type: USER_OWNER_TYPE })
      .whereNotNull("published_at")
      .where("created_at", ">=", since);
    return Number(row?.count ?? 0);
  };

  const [publishedPlugins, publishedTemplates] = await Promise.all([
    count(SUBMISSION_TABLES["api::package.package"]),
    count(SUBMISSION_TABLES["api::template.template"]),
  ]);

  return { publishedPlugins, publishedTemplates };
}

/** Users owning at least one submission `countPublishedSubmissions` counts. */
export async function findSubmissionOwnerIds(
  strapi: Core.Strapi,
): Promise<string[]> {
  // A Date, so knex binds it right for each database (SQLite stores
  // timestamps as milliseconds, Postgres/MySQL as timestamps).
  const since = new Date(CONTRIBUTIONS_SINCE);
  const ids = new Set<string>();

  for (const table of Object.values(SUBMISSION_TABLES)) {
    const rows: { owner_id: number }[] = await strapi.db
      .connection(table)
      .distinct("owner_id")
      .where({ owner_type: USER_OWNER_TYPE })
      .whereNotNull("published_at")
      .where("created_at", ">=", since);
    for (const row of rows) ids.add(String(row.owner_id));
  }

  return [...ids];
}

/** The owning user of a submission row, if it's owned by a user. */
export async function findSubmissionUserOwner(
  strapi: Core.Strapi,
  uid: SubmissionUid,
  id: number,
): Promise<number | null> {
  const row: { owner_id: number; owner_type: string } | undefined =
    await strapi.db
      .connection(SUBMISSION_TABLES[uid])
      .select("owner_id", "owner_type")
      .where({ id })
      .first();
  return row?.owner_type === USER_OWNER_TYPE ? row.owner_id : null;
}

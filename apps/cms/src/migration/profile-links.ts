import {
  type ProfileLinkType,
  validateProfileLinks,
} from "../extensions/better-auth/utils/profile-links";

type Link = { type: ProfileLinkType; value: string };

/** First path segment of a github.com URL, e.g. `octocat` from `https://github.com/octocat/repo`. */
const GITHUB_URL_PATTERN = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#]+)/i;

const isValid = (link: Link) => validateProfileLinks([link]).length === 0;

/** Adds a protocol to bare addresses like `example.com`. */
const withProtocol = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

/**
 * Maps the legacy `website`/`github` fields of a profile onto `links`
 * entries. A GitHub URL becomes a `github` handle; anything that doesn't
 * fit that (e.g. a non-GitHub URL in the `github` field) falls back to a
 * `website` link. Values that can't be made valid are dropped and returned
 * separately so they can be logged.
 */
const toLinks = (profile: {
  website?: string | null;
  github?: string | null;
}) => {
  const links: Link[] = [];
  const dropped: string[] = [];

  const website = profile.website?.trim();
  if (website) {
    const link: Link = { type: "website", value: withProtocol(website) };
    if (isValid(link)) links.push(link);
    else dropped.push(`website: ${website}`);
  }

  const github = profile.github?.trim();
  if (github) {
    const handle = github.match(GITHUB_URL_PATTERN)?.[1];
    const candidates: Link[] = [
      ...(handle ? [{ type: "github", value: handle } as Link] : []),
      { type: "website", value: withProtocol(github) },
    ];
    const link = candidates.find(isValid);
    if (link) links.push(link);
    else dropped.push(`github: ${github}`);
  }

  return { links, dropped };
};

/**
 * Moves the legacy `website`/`github` profile fields into the repeatable
 * `links` component (see docs/adr/0003-profile-links.md). Profiles that
 * already have links are skipped, so this is safe to re-run. The legacy
 * fields are left in place — they're removed in a follow-up.
 */
export const migrateProfileLinks = async () => {
  strapi.log.info("Starting profile links migration...");
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  const profiles = await strapi.documents("api::profile.profile").findMany({
    fields: ["documentId", "website", "github"],
    filters: {
      $or: [
        { website: { $notNull: true, $ne: "" } },
        { github: { $notNull: true, $ne: "" } },
      ],
    },
    populate: ["links"],
  });

  for (const profile of profiles) {
    try {
      if (profile.links?.length) {
        skipped++;
        continue;
      }

      const { links, dropped } = toLinks(profile);

      if (dropped.length) {
        strapi.log.warn(
          `Profile ${profile.documentId}: dropped invalid legacy values (${dropped.join(", ")})`,
        );
      }

      if (!links.length) {
        skipped++;
        continue;
      }

      await strapi.documents("api::profile.profile").update({
        documentId: profile.documentId,
        data: { links },
      });
      migrated++;
    } catch (error) {
      failed++;
      strapi.log.error(
        `Error migrating links for profile ${profile.documentId}:`,
        error,
      );
    }
  }

  strapi.log.info(
    `Profile links migration finished. Migrated: ${migrated}, Skipped: ${skipped}, Failed: ${failed}`,
  );
};

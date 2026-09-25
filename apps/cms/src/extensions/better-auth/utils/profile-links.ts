/**
 * Rules for the repeatable `profile.link` component on
 * `api::profile.profile` (see docs/adr/0003-profile-links.md). Social
 * types store only the handle — the public URL is built from a fixed
 * prefix at render time — while `website`/`other` store a full URL.
 *
 * The web app enforces the same rules inline before submitting; this is
 * the server-side backstop for anyone calling the API directly. Keep the
 * two in sync if either changes.
 *
 * The max of 10 links and the enum of types are also on the component
 * schema itself (apps/cms/src/components/profile/link.json), so Strapi
 * enforces them on every write path — they're re-checked here only to
 * return a readable message.
 */

export const PROFILE_LINK_TYPES = [
  "website",
  "github",
  "linkedin",
  "x",
  "instagram",
  "youtube",
  "linktree",
  "other",
] as const;

export type ProfileLinkType = (typeof PROFILE_LINK_TYPES)[number];

export const MAX_PROFILE_LINKS = 10;

const HANDLE_RULES: Partial<
  Record<ProfileLinkType, { label: string; pattern: RegExp; example: string }>
> = {
  github: {
    label: "GitHub",
    pattern: /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i,
    example: "octocat",
  },
  linkedin: {
    label: "LinkedIn",
    pattern: /^[a-z\d-]{3,100}$/i,
    example: "jane-doe",
  },
  x: {
    label: "X (Twitter)",
    pattern: /^[A-Za-z0-9_]{1,15}$/,
    example: "janedoe",
  },
  instagram: {
    label: "Instagram",
    pattern: /^[A-Za-z0-9._]{1,30}$/,
    example: "janedoe",
  },
  youtube: {
    label: "YouTube",
    pattern: /^[A-Za-z0-9._-]{3,30}$/,
    example: "janedoe",
  },
  linktree: {
    label: "Linktree",
    pattern: /^[A-Za-z0-9._]{2,30}$/,
    example: "janedoe",
  },
};

function isWebAddress(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

function isProfileLinkType(type: unknown): type is ProfileLinkType {
  return PROFILE_LINK_TYPES.includes(type as ProfileLinkType);
}

/**
 * Keeps only `type` and a trimmed `value` from each submitted link, so a
 * client can't pass component `id`s (or anything else) through to the
 * document service. `null` clears the list. Anything that isn't an array
 * is returned untouched for `validateProfileLinks` to reject.
 */
export function pickProfileLinks(value: unknown): unknown {
  if (value === null) return [];
  if (!Array.isArray(value)) return value;

  return value.map((link) => {
    if (typeof link !== "object" || link === null) return link;
    const { type, value } = link as Record<string, unknown>;
    return { type, value: typeof value === "string" ? value.trim() : value };
  });
}

export function validateProfileLinks(links: unknown): string[] {
  if (!Array.isArray(links)) return ["Links must be a list."];
  if (links.length > MAX_PROFILE_LINKS) {
    return [`Add up to ${MAX_PROFILE_LINKS} links.`];
  }

  const errors: string[] = [];

  links.forEach((link, index) => {
    const prefix = `Link ${index + 1}:`;
    const { type, value } = (link ?? {}) as Record<string, unknown>;

    if (!isProfileLinkType(type)) {
      errors.push(`${prefix} Choose a link type.`);
      return;
    }
    if (typeof value !== "string" || value === "") {
      errors.push(`${prefix} Enter an address or username.`);
      return;
    }

    const rule = HANDLE_RULES[type];
    if (!rule) {
      if (!isWebAddress(value)) {
        errors.push(
          `${prefix} Enter a full web address, like https://example.com.`,
        );
      }
      return;
    }

    if (!rule.pattern.test(value)) {
      errors.push(
        `${prefix} Enter a ${rule.label} username, like ${rule.example}.`,
      );
    }
  });

  return errors;
}

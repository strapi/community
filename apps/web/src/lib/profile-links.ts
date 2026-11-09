/**
 * Rules for the repeatable `profile.link` component on
 * `api::profile.profile` (see docs/adr/0003-profile-links.md). Social
 * types store only the handle — the public URL is built from `prefix` at
 * render time — while `website` stores a full URL.
 *
 * The API enforces the same rules server-side in
 * apps/cms/src/extensions/better-auth/utils/profile-links.ts. Keep the two
 * in sync if either changes.
 */

export const PROFILE_LINK_TYPES = [
  "website",
  "github",
  "linkedin",
  "x",
  "instagram",
  "youtube",
  "linktree",
] as const;

export type ProfileLinkType = (typeof PROFILE_LINK_TYPES)[number];

export type ProfileLink = { type: ProfileLinkType; value: string };

export const MAX_PROFILE_LINKS = 10;

type HandleRule = {
  /** Host + path the handle is appended to, without protocol. */
  prefix: string;
  pattern: RegExp;
  example: string;
};

export const PROFILE_LINK_TYPE_CONFIG: Record<
  ProfileLinkType,
  { label: string; handle?: HandleRule }
> = {
  website: { label: "Website" },
  github: {
    label: "GitHub",
    handle: {
      prefix: "github.com/",
      pattern: /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i,
      example: "octocat",
    },
  },
  linkedin: {
    label: "LinkedIn",
    handle: {
      prefix: "linkedin.com/in/",
      pattern: /^[a-z\d-]{3,100}$/i,
      example: "jane-doe",
    },
  },
  x: {
    label: "X (Twitter)",
    handle: {
      prefix: "x.com/",
      pattern: /^[A-Za-z0-9_]{1,15}$/,
      example: "janedoe",
    },
  },
  instagram: {
    label: "Instagram",
    handle: {
      prefix: "instagram.com/",
      pattern: /^[A-Za-z0-9._]{1,30}$/,
      example: "janedoe",
    },
  },
  youtube: {
    label: "YouTube",
    handle: {
      prefix: "youtube.com/@",
      pattern: /^[A-Za-z0-9._-]{3,30}$/,
      example: "janedoe",
    },
  },
  linktree: {
    label: "Linktree",
    handle: {
      prefix: "linktr.ee/",
      pattern: /^[A-Za-z0-9._]{2,30}$/,
      example: "janedoe",
    },
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

/**
 * Turns a pasted profile URL (e.g. `https://github.com/octocat/`) into the
 * bare handle the API expects. Anything that doesn't start with the type's
 * prefix is returned trimmed but otherwise untouched.
 */
export function normalizeProfileLinkValue(
  type: ProfileLinkType,
  value: string,
): string {
  const trimmed = value.trim();
  const handle = PROFILE_LINK_TYPE_CONFIG[type].handle;
  if (!handle) return trimmed;

  const withoutProtocol = trimmed.replace(/^https?:\/\//i, "");
  const withoutWww = withoutProtocol.replace(/^www\./i, "");
  if (!withoutWww.toLowerCase().startsWith(handle.prefix.toLowerCase())) {
    return trimmed.replace(/^@/, "");
  }

  return withoutWww.slice(handle.prefix.length).replace(/\/+$/, "");
}

export function validateProfileLink(link: ProfileLink): string | undefined {
  const value = link.value.trim();
  const handle = PROFILE_LINK_TYPE_CONFIG[link.type].handle;

  if (!value) {
    return handle ? "Enter a username." : "Enter a web address.";
  }

  if (!handle) {
    return isWebAddress(value)
      ? undefined
      : "Enter a full web address, like https://example.com.";
  }

  return handle.pattern.test(value)
    ? undefined
    : `Enter a ${PROFILE_LINK_TYPE_CONFIG[link.type].label} username, like ${handle.example}.`;
}

/**
 * Narrows links as typed by the generated Strapi client (every component
 * attribute optional) to `ProfileLink[]`. `type`/`value` are required on
 * the component schema, so nothing is actually dropped in practice.
 */
export function toProfileLinks(
  links:
    | { type?: ProfileLinkType | null; value?: string | null }[]
    | null
    | undefined,
): ProfileLink[] {
  return (links ?? []).flatMap(({ type, value }) =>
    type && value != null ? [{ type, value }] : [],
  );
}

/** The public URL a link points to — the handle appended to its prefix. */
export function profileLinkUrl(link: ProfileLink): string {
  const handle = PROFILE_LINK_TYPE_CONFIG[link.type].handle;
  return handle ? `https://${handle.prefix}${link.value}` : link.value;
}

import deburr from "lodash/deburr";
import kebabCase from "lodash/kebabCase";
import toLower from "lodash/toLower";

/**
 * Mirrors `strapi-plugin-webtools`'s default `slugify` exactly
 * (`node_modules/strapi-plugin-webtools/dist/server/index.js`), so a value
 * slugified here produces the same output the webtools URL-pattern engine
 * would produce for the same input. Used for `plugin::better-auth.user`'s
 * `slug` field so that re-slugifying an already-generated slug (once the
 * URL pattern is repointed at `/[slug]`) is a no-op.
 */
export function slugify(value: string): string {
  return kebabCase(deburr(toLower(value)));
}

/** Lowercase letters/digits separated by single hyphens — no leading, trailing, or doubled hyphens. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MIN_LENGTH = 3;
const SLUG_MAX_LENGTH = 60;

/**
 * Validates a `plugin::better-auth.user.slug` value a user is trying to
 * set through account settings. Unlike most other profile-ish fields, an
 * empty slug is never valid — the signup hook/migration always populate
 * one, and clearing it would break the user's profile URL.
 */
export function validateSlug(value: string): string | undefined {
  const trimmed = value.trim();

  if (trimmed.length < SLUG_MIN_LENGTH || trimmed.length > SLUG_MAX_LENGTH) {
    return `Profile URL must be between ${SLUG_MIN_LENGTH} and ${SLUG_MAX_LENGTH} characters.`;
  }
  if (!SLUG_PATTERN.test(trimmed)) {
    return "Profile URL can only contain lowercase letters, numbers, and hyphens.";
  }

  return undefined;
}

/** Whether `slug` is already used by another `plugin::better-auth.user`. */
export async function isSlugTaken(
  slug: string,
  { excludeUserId }: { excludeUserId?: string | number } = {},
): Promise<boolean> {
  const existing = await strapi.db.query("plugin::better-auth.user").findOne({
    where: {
      slug,
      ...(excludeUserId ? { id: { $ne: excludeUserId } } : {}),
    },
    select: ["id"],
  });

  return Boolean(existing);
}

/**
 * Generates a `slug` for `plugin::better-auth.user` that's unique among
 * existing users, appending `-0`, `-1`, `-2`, … on collision — mirroring
 * webtools' own `makeUniquePath` suffixing convention
 * (`node_modules/strapi-plugin-webtools/dist/server/index.js`).
 */
export async function generateUniqueUserSlug(
  name: string,
  options: { excludeUserId?: string | number } = {},
): Promise<string> {
  const base = slugify(name) || "user";
  let candidate = base;

  for (let iteration = -1; ; iteration++) {
    if (iteration >= 0) candidate = `${base}-${iteration}`;
    if (!(await isSlugTaken(candidate, options))) return candidate;
  }
}

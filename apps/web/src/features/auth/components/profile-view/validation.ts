import type { Profile } from "./types";

/**
 * Format rules for the profile fields, enforced here for inline
 * validation before anything is submitted. The API enforces the same
 * rules server-side for anyone calling it directly
 * (apps/cms/src/extensions/better-auth/utils/profile-validation.ts) —
 * keep the two in sync if either changes.
 */

export const BIO_MAX_LENGTH = 100;

/** `https://github.com/<username>` only — not a repo, gist, or org team link. */
const GITHUB_PROFILE_PATTERN =
  /^https:\/\/(www\.)?github\.com\/[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}\/?$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const VALIDATORS: Partial<
  Record<keyof Profile, (value: string) => string | undefined>
> = {
  bio: (value) =>
    value.length > BIO_MAX_LENGTH
      ? `Bio must be ${BIO_MAX_LENGTH} characters or fewer.`
      : undefined,
  website: (value) =>
    isHttpUrl(value)
      ? undefined
      : "Enter a valid URL, e.g. https://example.com.",
  github: (value) =>
    GITHUB_PROFILE_PATTERN.test(value)
      ? undefined
      : "Enter a valid GitHub profile URL, e.g. https://github.com/your-username.",
  email: (value) =>
    EMAIL_PATTERN.test(value) ? undefined : "Enter a valid email address.",
};

/**
 * Validates a single field's current value. Every field is optional — an
 * empty value is always valid — but a non-empty value must satisfy its
 * format rule.
 */
export function validateProfileField(
  name: keyof Profile,
  value: string | null | undefined,
): string | undefined {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return undefined;

  return VALIDATORS[name]?.(trimmed);
}

export function validateProfile(
  values: Profile,
): Partial<Record<keyof Profile, string>> {
  const errors: Partial<Record<keyof Profile, string>> = {};

  for (const field of Object.keys(VALIDATORS) as (keyof Profile)[]) {
    const error = validateProfileField(field, values[field]);
    if (error) errors[field] = error;
  }

  return errors;
}

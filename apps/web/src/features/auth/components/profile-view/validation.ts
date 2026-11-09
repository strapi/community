import { validateProfileLink } from "@/lib/profile-links";
import type { Profile, TextFieldName } from "./types";

/**
 * Format rules for the profile fields, enforced here for inline
 * validation before anything is submitted. The API enforces the same
 * rules server-side for anyone calling it directly — length limits (bio,
 * subtitle) via `maxLength` on the `api::profile.profile` schema
 * (apps/cms/src/api/profile/content-types/profile/schema.json), the rest
 * in apps/cms/src/extensions/better-auth/utils/profile-validation.ts.
 * Keep these in sync if either changes. Rules for `links` live in
 * apps/web/src/lib/profile-links.ts.
 */

export const BIO_MAX_LENGTH = 300;
export const SUBTITLE_MAX_LENGTH = 50;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALIDATORS: Partial<
  Record<TextFieldName, (value: string) => string | undefined>
> = {
  bio: (value) =>
    value.length > BIO_MAX_LENGTH
      ? `Bio must be ${BIO_MAX_LENGTH} characters or fewer.`
      : undefined,
  subtitle: (value) =>
    value.length > SUBTITLE_MAX_LENGTH
      ? `Subtitle must be ${SUBTITLE_MAX_LENGTH} characters or fewer.`
      : undefined,
  email: (value) =>
    EMAIL_PATTERN.test(value) ? undefined : "Enter a valid email address.",
};

/**
 * Validates a single field's current value. Every field is optional — an
 * empty value is always valid — but a non-empty value must satisfy its
 * format rule.
 */
export function validateProfileField(
  name: TextFieldName,
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

  for (const field of Object.keys(VALIDATORS) as TextFieldName[]) {
    const error = validateProfileField(field, values[field]);
    if (error) errors[field] = error;
  }

  if (values.links?.some((link) => validateProfileLink(link))) {
    errors.links = "Fix the highlighted links.";
  }

  return errors;
}

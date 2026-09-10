/**
 * Format rules for the `api::profile.profile` fields editable through the
 * web app's personal/organization "Profile" tabs. The web app already
 * enforces these inline before submitting
 * (apps/web/src/features/auth/components/profile-view/validation.ts) —
 * this is the server-side backstop for anyone calling the API directly.
 * Keep the two in sync if either changes.
 */

const BIO_MAX_LENGTH = 100;

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

const VALIDATORS: Record<string, (value: string) => string | undefined> = {
  bio: (value) =>
    value.length > BIO_MAX_LENGTH
      ? `Bio must be ${BIO_MAX_LENGTH} characters or fewer.`
      : undefined,
  website: (value) =>
    isHttpUrl(value)
      ? undefined
      : "Website must be a valid URL, e.g. https://example.com.",
  github: (value) =>
    GITHUB_PROFILE_PATTERN.test(value)
      ? undefined
      : "GitHub must be a valid GitHub profile URL, e.g. https://github.com/your-username.",
  email: (value) =>
    EMAIL_PATTERN.test(value)
      ? undefined
      : "Public email must be a valid email address.",
};

/**
 * Validates whichever of the fields above are present in `data`. Fields
 * are optional — omitting one, or sending it empty/null to clear it, is
 * always valid — but any non-empty value sent for one of them must pass
 * its format rule.
 */
export function validateProfileData(data: Record<string, unknown>): string[] {
  const errors: string[] = [];

  for (const [field, validate] of Object.entries(VALIDATORS)) {
    if (!(field in data)) continue;

    const value = data[field];
    if (typeof value !== "string" || value.trim() === "") continue;

    const error = validate(value.trim());
    if (error) errors.push(error);
  }

  return errors;
}

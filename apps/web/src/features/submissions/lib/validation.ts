import type { SubmissionType } from "./types";

/**
 * Inline validation for the edit form's plain-text fields, mirroring the
 * touched/submitAttempted pattern in
 * `apps/web/src/features/auth/components/profile-view/validation.ts`. Kept
 * intentionally light — `description` is only required for packages (see
 * `api::package.package`'s schema — templates leave it optional). The real
 * backstops either way: the server-side field whitelist/read-only guard
 * (`apps/cms/src/api/{package,template}/controllers/*.ts`) and, for
 * `DESCRIPTION_MAX_LENGTH`, the `maxLength` on each content type's
 * `description` schema attribute.
 */

export const NAME_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 100;

export type SubmissionFormValues = {
  name: string;
  description: string;
  /** Templates only — validated as a URL when present, but never required. */
  preview_link: string;
};

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateSubmissionField(
  type: SubmissionType,
  name: keyof SubmissionFormValues,
  value: string,
): string | undefined {
  const trimmed = value.trim();

  if (name === "name") {
    if (!trimmed) return "Name is required.";
    if (trimmed.length > NAME_MAX_LENGTH) {
      return `Name must be ${NAME_MAX_LENGTH} characters or fewer.`;
    }
  }

  if (name === "description") {
    if (type === "package" && !trimmed) return "Description is required.";
    if (trimmed.length > DESCRIPTION_MAX_LENGTH) {
      return `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`;
    }
  }

  if (name === "preview_link" && trimmed && !isHttpUrl(trimmed)) {
    return "Enter a valid URL, e.g. https://example.com.";
  }

  return undefined;
}

export function validateSubmissionForm(
  type: SubmissionType,
  values: SubmissionFormValues,
): Partial<Record<keyof SubmissionFormValues, string>> {
  const errors: Partial<Record<keyof SubmissionFormValues, string>> = {};

  for (const field of ["name", "description", "preview_link"] as const) {
    const error = validateSubmissionField(type, field, values[field]);
    if (error) errors[field] = error;
  }

  return errors;
}

import { BASE_ERROR_CODES } from "@better-auth/core/error";

/**
 * Friendlier messages for the `?error=<code>` better-auth appends when a redirect-based
 * flow fails — OAuth sign-in/linking callbacks (snake_case codes, sent via
 * the CMS's `onAPIError.errorURL`), and email verification, magic link and
 * password reset links (UPPER_CASE codes, sent to their callback URL).
 * Anything not listed here falls back to `getAuthErrorMessage`'s derivation.
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // OAuth (sign-in and account linking)
  access_denied: "Sign-in was cancelled.",
  "email_doesn't_match":
    "That account's email doesn't match the email on your account.",
  account_already_linked_to_different_user:
    "That account is already linked to a different user.",
  unable_to_link_account: "We couldn't link that account. Please try again.",
  account_not_linked:
    "An account with this email already exists. Sign in with your existing method, then link this provider from your account settings.",
  signup_disabled: "Sign-ups are currently disabled.",
  email_not_found:
    "The provider didn't share an email address. Please use another sign-in method.",
  unable_to_create_user: "We couldn't create your account. Please try again.",
  unable_to_create_session: "We couldn't sign you in. Please try again.",
  state_mismatch: "Your sign-in session expired. Please try again.",
  state_not_found: "Your sign-in session expired. Please try again.",
  please_restart_the_process: "Your sign-in session expired. Please try again.",
  // Email verification, magic link and password reset
  INVALID_TOKEN: "This link is invalid or has already been used.",
  TOKEN_EXPIRED: "This link has expired. Please request a new one.",
  EXPIRED_TOKEN: "This link has expired. Please request a new one.",
  ATTEMPTS_EXCEEDED: "This link has expired. Please request a new one.",
  USER_NOT_FOUND: "We couldn't find an account for this link.",
  INVALID_USER:
    "This link belongs to a different account. Sign out and try again.",
  new_user_signup_disabled: "No account exists for this email address.",
  failed_to_create_user: "We couldn't create your account. Please try again.",
  failed_to_create_session: "We couldn't sign you in. Please try again.",
};

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

const BASE_ERROR_MESSAGES: Record<string, string> = Object.fromEntries(
  Object.entries(BASE_ERROR_CODES).map(([key, { message }]) => [key, message]),
);

/** `email_doesn't_match` / `TOKEN_EXPIRED` → "Email doesn't match." / "Token expired." */
function humanizeErrorCode(code: string): string {
  const words = code.replace(/_/g, " ").trim().toLowerCase();
  return `${words.charAt(0).toUpperCase()}${words.slice(1)}.`;
}

/**
 * Resolves a redirect `?error=` code to a message — the redirect usually
 * carries no `error_description`, so in order of preference: our own copy,
 * the description if there is one, better-auth's built-in message for the
 * code (case-insensitive, since redirects mix `failed_to_create_user` and
 * `FAILED_TO_CREATE_USER` styles), and finally the code itself, humanized.
 */
export function getAuthErrorMessage(
  code: string,
  description?: string | null,
): string {
  if (AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  if (description) return description;

  const baseMessage = BASE_ERROR_MESSAGES[code.toUpperCase()];
  if (baseMessage) return `${baseMessage}.`;

  if (!code || code === "UNKNOWN") return FALLBACK_MESSAGE;
  return humanizeErrorCode(code);
}

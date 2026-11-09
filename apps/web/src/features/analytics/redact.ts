// Query parameters that can carry personal data or secrets. /auth/check-email
// puts the visitor's email in the URL, and auth callbacks carry tokens.
// Redirect targets (callbackURL, redirectTo) are redacted whole, because their
// value is itself a URL that can carry any of the others. The GA4 stream
// redacts the same list as a second line of defence.
const REDACTED_PARAMS = [
  "email",
  "token",
  "code",
  "callbackURL",
  "redirectTo",
  "invitationId",
  "error_description",
];

/**
 * Returns `href` with sensitive query parameter values replaced and the
 * fragment dropped (auth flows can put tokens there).
 */
export function redactUrl(href: string): string {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return href;
  }
  for (const param of REDACTED_PARAMS) {
    if (url.searchParams.has(param)) url.searchParams.set(param, "redacted");
  }
  url.hash = "";
  return url.toString();
}

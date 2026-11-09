/**
 * Post-auth redirect targets (`?redirectTo=`) come straight from the URL,
 * so an attacker could otherwise craft a sign-in link that bounces the
 * victim to an external site right after they log in. Only same-origin
 * paths are allowed — a leading `/` that isn't followed by another `/` or
 * `\` (both of which browsers treat as protocol-relative, i.e. another
 * host). Anything else falls back to `fallback`.
 */
export function safeRedirectPath(
  href: string | null | undefined,
  fallback = "/account",
): string {
  if (!href?.startsWith("/") || /^\/[/\\]/.test(href)) {
    return fallback;
  }
  return href;
}

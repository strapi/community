import type { PageType } from "./events";

/**
 * Fallback page type for routes that don't render <PageContext>. CMS pages
 * all live under the catch-all route and set their own type, so this only
 * has to know the app's fixed routes.
 */
export function pageTypeFromPath(pathname: string): PageType {
  if (pathname === "/") return "home";
  if (pathname === "/marketplace") return "marketplace";
  if (pathname === "/roadmap") return "roadmap";
  if (pathname.startsWith("/submit/plugin")) return "submit_plugin";
  if (pathname.startsWith("/submit/template")) return "submit_template";
  if (pathname.startsWith("/auth")) return "auth";
  if (pathname.startsWith("/account")) return "account";
  if (pathname.startsWith("/org/")) return "org_settings";
  if (pathname.startsWith("/partner/")) return "partner_portal";
  return "overview";
}

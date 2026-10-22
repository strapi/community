import "server-only";

import DOMPurify from "isomorphic-dompurify";

const SVG_MIME = "image/svg+xml";

/**
 * If `file` is an SVG, returns a new `File` with its XML content sanitized
 * (script tags, `on*` event handlers, `<foreignObject>`, etc. stripped);
 * returns `file` unchanged for every other type.
 *
 * SVG is XML that can carry executable script — a real, validly-typed SVG
 * can still be a stored-XSS payload, which `ALLOWED_IMAGE_TYPES` (a
 * declared-MIME allow-list, in `./strapi.ts`) doesn't catch, since that
 * only confirms the upload really is SVG, not that its content is inert.
 * This is the pre-review "Submit a plugin/template" form's own copy of the
 * same sanitization the CMS applies to its own uploads (avatars, org
 * logos, package icons, template preview images — see
 * `apps/cms/src/extensions/better-auth/utils/sanitize-svg.ts`) — this
 * path uploads straight to Strapi's `/api/upload` and never reaches that
 * code.
 */
export async function sanitizeIfSvg(file: File): Promise<File> {
  if (file.type !== SVG_MIME) return file;

  const raw = await file.text();
  const clean = DOMPurify.sanitize(raw, {
    USE_PROFILES: { svg: true, svgFilters: true },
  });

  return new File([clean], file.name, { type: SVG_MIME });
}

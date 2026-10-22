import { readFile, writeFile } from "node:fs/promises";
import DOMPurify from "isomorphic-dompurify";

const SVG_MIME = "image/svg+xml";

/**
 * If `file` (a formidable-parsed upload — see its `filepath`/`mimetype`) is
 * an SVG, sanitizes its XML content *in place* on disk before it's handed
 * to the upload service. SVG is XML that can carry a `<script>` tag or
 * `on*` event handlers — a real, validly-typed SVG can still be a stored-XSS
 * payload, and no MIME-type check (declared or content-sniffed) catches
 * that, since such a check only confirms the file really *is* SVG, not
 * that its content is inert.
 *
 * Every avatar/logo/icon/preview-image upload in this plugin accepts
 * `image/*`, including SVG — see `uploadOwnedFile` below (avatars/logos)
 * and `uploadImage` in `controllers/submissions.ts` (package icons/template
 * preview images) — and uploads are served from the same origin as the
 * better-auth session cookie (Strapi's local upload provider; see
 * `config/env/production/plugins.ts`). An unsanitized SVG opened directly
 * is therefore a same-origin XSS running with the viewer's ambient
 * session, not just a defaced image. `apps/web/src/features/submit/server/
 * sanitize-svg.ts` sanitizes the same way for the pre-review "Submit a
 * plugin/template" form, which uploads straight to Strapi's own
 * `/api/upload` and never reaches this code path.
 *
 * No-op for every other file type.
 */
export async function sanitizeIfSvg(file: {
  filepath?: string;
  mimetype?: string;
}): Promise<void> {
  if (file.mimetype !== SVG_MIME || !file.filepath) return;

  const raw = await readFile(file.filepath, "utf8");
  const clean = DOMPurify.sanitize(raw, {
    USE_PROFILES: { svg: true, svgFilters: true },
  });
  await writeFile(file.filepath, clean, "utf8");
}

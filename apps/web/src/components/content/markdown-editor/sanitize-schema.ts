import { defaultSchema, type Options as SanitizeSchema } from "rehype-sanitize";

/**
 * Shared `rehype-sanitize` schema for every "readme"-style markdown render
 * in the app (the read-only `Markdown` component and this editor's own
 * preview) — both pipe user-submitted markdown through `rehype-raw` (so
 * embedded raw HTML becomes real DOM), which is only safe to render
 * alongside a sanitize pass that strips `<script>`, event handlers
 * (`onerror`, `onclick`, ...), and non-http(s) URLs (`javascript:`, `data:`)
 * a submitter could otherwise smuggle into their profile/package/template
 * readme and have execute in every visitor's browser.
 *
 * Extends `rehype-sanitize`'s GitHub-style `defaultSchema` (already
 * compatible with `remark-gfm`'s tables/task-lists and this app's
 * `language-xxx` code-block classes) with the `id` attribute on headings —
 * `defaultSchema` allows `id` but prefixes it (`user-content-...`) via its
 * DOM-clobbering guard; that's fine here since nothing in this app links to
 * `rehype-slug`'s raw (unprefixed) heading ids.
 */
export const MARKDOWN_SANITIZE_SCHEMA: SanitizeSchema = defaultSchema;

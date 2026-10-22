"use client";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { MARKDOWN_SANITIZE_SCHEMA } from "./sanitize-schema";

// The underlying CodeMirror instance needs the DOM, so this can't render
// server-side.
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
});

/**
 * Shared markdown editor for every "readme"-style field in the app (the
 * "Submissions" edit form, the account/organization profile form, the
 * original public submit form) — wired to the same
 * remark-gfm/rehype-raw/rehype-sanitize/rehype-slug pipeline as the
 * read-only `Markdown` render component (`components/content/markdown`),
 * so a submission's live page renders the same GFM tables/raw-HTML/
 * heading-anchors its editor preview showed. `rehype-sanitize` (shared
 * schema in `./sanitize-schema`) strips `<script>`, event-handler
 * attributes, and non-http(s) URLs that `rehype-raw` would otherwise turn
 * into live DOM — without it, anyone editing this field could inject
 * markup that executes in every later viewer's browser.
 *
 * `disabled` swaps to a read-only rendered preview (no textarea, no
 * toolbar) rather than a merely-inert editor — matches how every other
 * disabled field in these forms shows its value without inviting a click —
 * and, like those other fields (`disabled:opacity-50` on `Input`/`Textarea`,
 * the same wrapper trick on the image upload above this field in the
 * submission edit form), dims and blocks pointer events on the whole thing
 * so it visibly reads as "not editable right now" rather than as a
 * differently-styled but still-normal field. This matters most for the
 * readme field specifically: it renders disabled not only when the viewer
 * lacks edit rights but also whenever readme auto-sync is on, and without
 * this dimming that case was easy to mistake for a broken/read-only editor
 * instead of an intentionally-locked one.
 *
 * Defaults to plain `edit` mode (a single editable pane) rather than
 * `live` (a side-by-side editor+preview split) — the split view reads as
 * "just a markdown preview" at typical form widths, and burying an
 * editable field behind that is worse than just editing it directly. The
 * toolbar's own edit/live/preview toggle still lets anyone switch to a
 * live preview themselves.
 */
export function MarkdownEditor({
  id,
  value,
  onChange,
  disabled,
  placeholder,
  height = 320,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  height?: number;
}) {
  return (
    <div
      data-color-mode="light"
      className={cn(disabled && "pointer-events-none opacity-50")}
    >
      <MDEditor
        id={id}
        value={value}
        onChange={(next) => onChange(next ?? "")}
        height={height}
        preview={disabled ? "preview" : "edit"}
        hideToolbar={disabled}
        visibleDragbar={false}
        textareaProps={{ placeholder, readOnly: disabled, disabled }}
        previewOptions={{
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeRaw,
            [rehypeSanitize, MARKDOWN_SANITIZE_SCHEMA],
            rehypeSlug,
          ],
        }}
      />
    </div>
  );
}

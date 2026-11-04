type Props = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Renders schema.org structured data. `<` is escaped so CMS content can't
 * close the script tag early.
 *
 * The wrapper element matters: a bare <script> as a sibling of streamed
 * content intermittently threw off hydration (React #418).
 */
const JsonLd = ({ data }: Props) => (
  <div hidden>
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: serialized JSON, `<` escaped
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  </div>
);

export { JsonLd };

type Props = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Renders schema.org structured data. `<` is escaped so CMS content can't
 * close the script tag early.
 */
const JsonLd = ({ data }: Props) => (
  <script
    type="application/ld+json"
    // biome-ignore lint/security/noDangerouslySetInnerHtml: serialized JSON, `<` escaped
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    }}
  />
);

export { JsonLd };

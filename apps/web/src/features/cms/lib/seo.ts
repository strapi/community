import type { Metadata } from "next";

export const SITE_NAME = "Strapi Community";

const MIN_DESCRIPTION_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 160;

const PACKAGE_TYPE_LABELS: Record<string, string> = {
  plugin: "Plugin",
  provider: "Provider",
  sdk: "SDK",
  tool: "Tool",
};

export const packageTypeLabel = (type: string | null | undefined) =>
  PACKAGE_TYPE_LABELS[type ?? ""] ?? "Plugin";

/**
 * The page <title>. The root layout appends "| Strapi Community"; skip that
 * when the title already names the site so the words aren't repeated.
 */
export function pageTitle(
  title: string | null | undefined,
): Metadata["title"] | undefined {
  if (!title) return undefined;
  return title.toLowerCase().includes(SITE_NAME.toLowerCase())
    ? { absolute: title }
    : title;
}

/** Joins title parts, e.g. ("Webtools", "Plugin", "by PluginPal"). */
export function joinTitle(
  ...parts: (string | null | undefined | false)[]
): string {
  return parts.filter(Boolean).join(" ");
}

const endSentence = (text: string) =>
  /[.!?…]$/.test(text) ? text : `${text}.`;

/**
 * Builds a meta description from the entry's own text, padded with
 * contextual sentences until it reaches a useful length, and clamped to
 * what search engines display.
 */
export function pageDescription(
  ...parts: (string | false | 0 | null | undefined)[]
): string | undefined {
  let description = "";

  for (const part of parts) {
    const text = part ? part.trim().replace(/\s+/g, " ") : "";
    if (!text) continue;
    if (description.length >= MIN_DESCRIPTION_LENGTH) break;
    description = description ? `${endSentence(description)} ${text}` : text;
  }

  if (!description) return undefined;
  if (description.length <= MAX_DESCRIPTION_LENGTH) return description;

  const clipped = description.slice(0, MAX_DESCRIPTION_LENGTH - 1);
  return `${clipped.slice(0, clipped.lastIndexOf(" ")).replace(/[,;:.]$/, "")}…`;
}

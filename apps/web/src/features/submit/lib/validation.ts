export const URL_RE = /^https?:\/\//i;

export const DESCRIPTION_MAX_LENGTH = 100;

/** Mirrors the `type` enum on the CMS `package` content type. */
export const PACKAGE_TYPES = [
  { value: "plugin", label: "Plugin" },
  { value: "provider", label: "Provider" },
  { value: "sdk", label: "SDK" },
  { value: "tool", label: "Tool" },
] as const;

export type PackageType = (typeof PACKAGE_TYPES)[number]["value"];

export function isPackageType(value: unknown): value is PackageType {
  return PACKAGE_TYPES.some((t) => t.value === value);
}

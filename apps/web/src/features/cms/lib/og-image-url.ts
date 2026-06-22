export function buildOgImageUrl(
  base: string,
  params: { name: string; type: string; icon?: string; description?: string },
): string {
  const url = new URL("/api/og", base);
  url.searchParams.set("name", params.name);
  url.searchParams.set("type", params.type);
  if (params.icon) url.searchParams.set("icon", params.icon);
  if (params.description)
    url.searchParams.set("description", params.description.slice(0, 120));
  return url.toString();
}

import type { FooterContent } from "../types/footer";

const STRAPI_URL = process.env["STRAPI_UI_URL"] ?? "https://cms.strapi.io";
const STRAPI_TOKEN = process.env["STRAPI_UI_TOKEN"];

export async function fetchFooter(): Promise<FooterContent[] | null> {
  const url = `${STRAPI_URL}/api/footer?locale=en&populateDynamicZone%5Bcontent%5D=true`;
  const headers: Record<string, string> = {};
  if (STRAPI_TOKEN) headers["Authorization"] = `Bearer ${STRAPI_TOKEN}`;

  try {
    const res = await fetch(url, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`[strapi-ui] Failed to fetch footer: ${res.status}`);
      return null;
    }

    const json = (await res.json()) as {
      data: { content: FooterContent[] };
    };
    return json.data.content ?? null;
  } catch (e: unknown) {
    console.error(
      `[strapi-ui] Error fetching footer:`,
      e instanceof Error ? e.message : String(e),
    );
    return null;
  }
}

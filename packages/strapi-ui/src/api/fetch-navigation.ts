import type { NavbarData } from "../types/navigation";

const STRAPI_URL = process.env["STRAPI_UI_URL"] ?? "https://cms.strapi.io";
const STRAPI_TOKEN = process.env["STRAPI_UI_TOKEN"];

export async function fetchNavigation(): Promise<NavbarData | null> {
  try {
    const url = `${STRAPI_URL}/api/header?locale=en&populateDynamicZone%5Bcontent%5D=true`;

    const headers: Record<string, string> = {};
    if (STRAPI_TOKEN) {
      headers["Authorization"] = `Bearer ${STRAPI_TOKEN}`;
    }

    const res = await fetch(url, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(
        `[strapi-ui] Failed to fetch navigation: ${url} ${res.status} ${res.statusText}`,
      );
      return null;
    }

    const json = (await res.json()) as {
      data: { content: Array<{ __component: string } & NavbarData> };
    };
    const navbar = json.data.content.find(
      (item) => item.__component === "navigation.navbar",
    );

    return navbar ?? null;
  } catch (err) {
    console.error("[strapi-ui] Error fetching navigation:", err);
    return null;
  }
}

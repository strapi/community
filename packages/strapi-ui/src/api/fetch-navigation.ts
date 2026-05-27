import type { NavbarData } from "../types/navigation";

const STRAPI_URL = process.env["STRAPI_UI_URL"];
const STRAPI_TOKEN = process.env["STRAPI_UI_TOKEN"];

export async function fetchNavigation(): Promise<NavbarData | null> {
  if (!STRAPI_URL || !STRAPI_TOKEN) {
    console.warn(
      "[strapi-ui] STRAPI_UI_URL or STRAPI_UI_TOKEN is not set — skipping navigation fetch.",
    );
    return null;
  }

  try {
    const url = `${STRAPI_URL}/api/header?locale=en&populateDynamicZone%5Bcontent%5D=true`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(
        `[strapi-ui] Failed to fetch navigation: ${res.status} ${res.statusText}`,
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

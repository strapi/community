import { NextResponse } from "next/server";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? "http://localhost:1337";
const CMS_BEARER_TOKEN = process.env.CMS_BEARER_TOKEN;

/**
 * GET /api/categories
 * Server-side proxy that fetches published categories from Strapi.
 * Avoids CORS issues and keeps the CMS token out of the browser.
 */
export async function GET() {
  try {
    const res = await fetch(
      `${CMS_URL}/api/categories?pagination[pageSize]=100&sort=name:asc&fields[0]=name&status=published`,
      {
        headers: {
          ...(CMS_BEARER_TOKEN
            ? { Authorization: `Bearer ${CMS_BEARER_TOKEN}` }
            : {}),
        },
        next: { revalidate: 300 },
      },
    );

    if (!res.ok) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}

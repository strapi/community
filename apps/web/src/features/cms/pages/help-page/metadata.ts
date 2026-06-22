import type { Metadata } from "next";
import { buildOgImageUrl } from "@/features/cms/lib/og-image-url";
import { cmsClient } from "@/features/cms/lib/strapi";

export const helpPageMetadata = async (
  documentId: string,
): Promise<Metadata> => {
  const document = await cmsClient
    .collection("api::help-page.help-page")
    .findOne(documentId, {
      fields: ["title", "description"],
      populate: { url_alias: true },
    });

  const { title, description } = document.data;
  const urlAlias = (document.data as Record<string, unknown>).url_alias as
    | { url_path?: string }[]
    | null
    | undefined;

  const desc = description ?? undefined;
  const webUrl =
    process.env.NEXT_PUBLIC_WEB_URL ?? "https://community.strapi.io";
  const pageUrl = urlAlias?.[0]?.url_path
    ? `${webUrl}${urlAlias[0].url_path}`
    : undefined;
  const ogImageUrl = buildOgImageUrl(webUrl, {
    name: title ?? "",
    type: "Help",
    description: desc,
  });

  return {
    title,
    description: desc,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: title ?? undefined,
      description: desc,
      type: "website",
      url: pageUrl,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title ?? "" }],
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? undefined,
      description: desc,
      images: [ogImageUrl],
    },
  };
};

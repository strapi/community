import type { Metadata } from "next";
import { buildOgImageUrl } from "@/features/cms/lib/og-image-url";
import { cmsClient } from "@/features/cms/lib/strapi";

export const packageCategoryMetadata = async (
  documentId: string,
): Promise<Metadata> => {
  const document = await cmsClient
    .collection("api::package-category.package-category")
    .findOne(documentId, {
      fields: ["name", "description"],
      populate: { url_alias: true },
    });

  const { name, description } = document.data;
  const urlAlias = (document.data as Record<string, unknown>).url_alias as
    | { url_path?: string }[]
    | null
    | undefined;

  const webUrl =
    process.env.NEXT_PUBLIC_WEB_URL ?? "https://community.strapi.io";
  const pageUrl = urlAlias?.[0]?.url_path
    ? `${webUrl}${urlAlias[0].url_path}`
    : undefined;
  const ogImageUrl = buildOgImageUrl(webUrl, {
    name: name ?? "",
    type: "Plugins",
    description: description ?? undefined,
  });

  return {
    title: name,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: name ?? undefined,
      description: description ?? undefined,
      type: "website",
      url: pageUrl,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: name ?? "" }],
    },
    twitter: {
      card: "summary_large_image",
      title: name ?? undefined,
      description: description ?? undefined,
      images: [ogImageUrl],
    },
  };
};

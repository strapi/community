import type { Metadata } from "next";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import { buildOgImageUrl } from "@/features/cms/lib/og-image-url";
import { cmsClient } from "@/features/cms/lib/strapi";
import type { Owner } from "@/utils/types";

export const packageMetadata = async (
  documentId: string,
): Promise<Metadata> => {
  const document = await cmsClient
    .collection("api::package.package")
    .findOne(documentId, {
      fields: ["name", "description"],
      populate: {
        icon: true,
        url_alias: true,
        owner: true,
      },
    });

  const { name, description, icon, url_alias } = document.data;
  const owner = document.data.owner as Owner;

  const iconUrl = icon?.url ? cmsImageUrl(icon.url) : undefined;
  const webUrl =
    process.env.NEXT_PUBLIC_WEB_URL ?? "https://community.strapi.io";
  const pageUrl = url_alias?.[0]?.url_path
    ? `${webUrl}${url_alias[0].url_path}`
    : undefined;
  const ogImageUrl = buildOgImageUrl(webUrl, {
    name: name ?? "",
    type: "Package",
    icon: iconUrl,
    description: description ?? undefined,
  });

  console.log("owner", owner);

  return {
    title: name,
    description,
    authors: owner?.name ? [{ name: owner.name }] : undefined,
    alternates: { canonical: pageUrl },
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

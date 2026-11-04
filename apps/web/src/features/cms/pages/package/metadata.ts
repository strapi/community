import type { Metadata } from "next";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import { buildOgImageUrl } from "@/features/cms/lib/og-image-url";
import {
  joinTitle,
  packageTypeLabel,
  pageDescription,
  pageTitle,
} from "@/features/cms/lib/seo";
import { cmsClient } from "@/features/cms/lib/strapi";
import { formatDownloads, formatStars } from "@/utils/numbers";
import type { Owner } from "@/utils/types";

export const packageMetadata = async (
  documentId: string,
): Promise<Metadata> => {
  const document = await cmsClient
    .collection("api::package.package")
    .findOne(documentId, {
      fields: ["name", "description", "type", "stars", "monthly_downloads"],
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

  const typeLabel = packageTypeLabel(document.data.type);
  const title = joinTitle(name, typeLabel, owner?.name && `by ${owner.name}`);
  const desc = pageDescription(
    description,
    `Strapi ${typeLabel.toLowerCase()}${owner?.name ? ` by ${owner.name}` : ""}.`,
    document.data.monthly_downloads &&
      `${formatDownloads(document.data.monthly_downloads)} monthly downloads on npm.`,
    document.data.stars && `${formatStars(document.data.stars)} GitHub stars.`,
    "Installation guide, docs and compatibility details on the Strapi Community marketplace.",
  );
  return {
    title: pageTitle(title),
    description: desc,
    authors: owner?.name ? [{ name: owner.name }] : undefined,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description: desc,
      type: "website",
      url: pageUrl,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: name ?? "" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogImageUrl],
    },
  };
};

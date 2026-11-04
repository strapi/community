import type { Metadata } from "next";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import { buildOgImageUrl } from "@/features/cms/lib/og-image-url";
import { joinTitle, pageDescription, pageTitle } from "@/features/cms/lib/seo";
import { cmsClient } from "@/features/cms/lib/strapi";

export const templateMetadata = async (
  documentId: string,
): Promise<Metadata> => {
  const document = await cmsClient
    .collection("api::template.template")
    .findOne(documentId, {
      fields: ["name", "description"],
      populate: {
        preview_image: true,
        url_alias: true,
        owner: true,
      },
    });

  const { name, description } = document.data;
  const owner = document.data.owner as { name?: string | null } | null;
  const previewImage = (document.data as Record<string, unknown>)
    .preview_image as { url?: string } | null | undefined;
  const urlAlias = (document.data as Record<string, unknown>).url_alias as
    | { url_path?: string }[]
    | null
    | undefined;

  const webUrl =
    process.env.NEXT_PUBLIC_WEB_URL ?? "https://community.strapi.io";
  const pageUrl = urlAlias?.[0]?.url_path
    ? `${webUrl}${urlAlias[0].url_path}`
    : undefined;

  const previewUrl = previewImage?.url
    ? cmsImageUrl(previewImage.url)
    : undefined;
  const ogImageUrl = buildOgImageUrl(webUrl, {
    name: name ?? "",
    type: "Template",
    icon: previewUrl,
    description: description ?? undefined,
  });

  const title = joinTitle(name, "Template", owner?.name && `by ${owner.name}`);
  const desc = pageDescription(
    description,
    `Strapi starter template${owner?.name ? ` by ${owner.name}` : ""}.`,
    "See the live preview, source code and setup instructions on the Strapi Community.",
  );
  return {
    title: pageTitle(title),
    description: desc,
    authors: owner?.name ? [{ name: owner.name }] : undefined,
    alternates: {
      canonical: pageUrl,
    },
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

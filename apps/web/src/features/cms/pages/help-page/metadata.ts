import type { Metadata } from "next";
import { buildOgImageUrl } from "@/features/cms/lib/og-image-url";
import { joinTitle, pageDescription, pageTitle } from "@/features/cms/lib/seo";
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

  const seoTitle = joinTitle(title, "– Help Center");
  const seoDesc = pageDescription(
    desc,
    "Guides and answers about plugins, templates and your account from the Strapi Community help center.",
  );
  return {
    title: pageTitle(seoTitle),
    description: seoDesc,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      type: "website",
      url: pageUrl,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title ?? "" }],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDesc,
      images: [ogImageUrl],
    },
  };
};

import type { Metadata } from "next";
import type { OpenGraphType } from "next/dist/lib/metadata/types/opengraph-types";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import { buildOgImageUrl } from "@/features/cms/lib/og-image-url";
import {
  pageDescription as buildDescription,
  pageTitle as buildTitle,
  joinTitle,
} from "@/features/cms/lib/seo";
import { cmsClient } from "@/features/cms/lib/strapi";

export const integrationMetadata = async (
  documentId: string,
): Promise<Metadata> => {
  const document = await cmsClient
    .collection("api::integration.integration")
    .findOne(documentId, {
      fields: ["name", "description"],
      populate: {
        seo: {
          populate: {
            openGraph: true,
          },
        },
        logo: true,
        url_alias: true,
      },
    });

  const { name, description, seo: metadata } = document.data;
  const logo = (document.data as Record<string, unknown>).logo as
    | { url?: string }
    | null
    | undefined;
  const urlAlias = (document.data as Record<string, unknown>).url_alias as
    | { url_path?: string }[]
    | null
    | undefined;

  const webUrl =
    process.env.NEXT_PUBLIC_WEB_URL ?? "https://community.strapi.io";
  const pageUrl = urlAlias?.[0]?.url_path
    ? `${webUrl}${urlAlias[0].url_path}`
    : undefined;
  const pageTitle = metadata?.metaTitle || joinTitle(name, "Integration Guide");
  const pageDescription = buildDescription(
    metadata?.metaDescription || description,
    `Learn how to use ${name} with Strapi, with related plugins and starter templates from the community.`,
  );
  const logoUrl = logo?.url ? cmsImageUrl(logo.url) : undefined;
  const ogImageUrl = buildOgImageUrl(webUrl, {
    name: pageTitle ?? "",
    type: "Integration",
    icon: logoUrl,
    description: pageDescription,
  });

  return {
    title: buildTitle(pageTitle),
    description: pageDescription,
    keywords: metadata?.keywords,
    viewport: metadata?.metaViewport,
    robots: metadata?.metaRobots,
    alternates: {
      canonical: metadata?.canonicalURL || pageUrl,
    },
    openGraph: metadata?.openGraph
      ? {
          title: metadata.openGraph.ogTitle || pageTitle || "",
          description:
            metadata.openGraph.ogDescription || pageDescription || "",
          url: pageUrl ?? (metadata.openGraph.ogUrl || ""),
          type: (metadata.openGraph.ogType as OpenGraphType) || "website",
          images: [
            { url: ogImageUrl, width: 1200, height: 630, alt: pageTitle ?? "" },
          ],
        }
      : {
          images: [
            { url: ogImageUrl, width: 1200, height: 630, alt: pageTitle ?? "" },
          ],
        },
    twitter: {
      card: "summary_large_image",
      title: metadata?.openGraph?.ogTitle || pageTitle || undefined,
      description:
        metadata?.openGraph?.ogDescription || pageDescription || undefined,
      images: [ogImageUrl],
    },
  };
};

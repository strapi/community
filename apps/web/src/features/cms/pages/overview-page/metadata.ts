import type { Metadata } from "next";
import type { OpenGraphType } from "next/dist/lib/metadata/types/opengraph-types";
import { buildOgImageUrl } from "@/features/cms/lib/og-image-url";
import {
  pageDescription as buildDescription,
  pageTitle as buildTitle,
} from "@/features/cms/lib/seo";
import { cmsClient } from "@/features/cms/lib/strapi";

export const overviewPageMetadata = async (
  documentId: string,
): Promise<Metadata> => {
  const document = await cmsClient
    .collection("api::overview-page.overview-page")
    .findOne(documentId, {
      fields: ["title", "description"],
      populate: {
        seo: {
          populate: {
            openGraph: true,
          },
        },
      },
    });

  const { title, description, seo: metadata } = document.data;

  const webUrl =
    process.env.NEXT_PUBLIC_WEB_URL ?? "https://community.strapi.io";
  const pageTitle = metadata?.metaTitle || title;
  const pageDescription = buildDescription(
    metadata?.metaDescription || description,
    "Part of the Strapi Community: plugins, templates, integrations and members building with Strapi.",
  );
  const ogImageUrl = buildOgImageUrl(webUrl, {
    name: pageTitle ?? "",
    type: "Strapi",
    description: pageDescription,
  });

  return {
    title: buildTitle(pageTitle),
    description: pageDescription,
    keywords: metadata?.keywords,
    viewport: metadata?.metaViewport,
    robots: metadata?.metaRobots,
    alternates: {
      canonical: metadata?.canonicalURL || undefined,
    },
    openGraph: metadata?.openGraph
      ? {
          title: metadata.openGraph.ogTitle || pageTitle || "",
          description:
            metadata.openGraph.ogDescription || pageDescription || "",
          url: metadata.openGraph.ogUrl || undefined,
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

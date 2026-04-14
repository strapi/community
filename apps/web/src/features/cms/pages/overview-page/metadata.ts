import type { Metadata } from "next";
import type { OpenGraphType } from "next/dist/lib/metadata/types/opengraph-types";
import { cmsClient } from "@/features/cms/lib/strapi";

export const overviewPageMetadata = async (
  documentId: string,
): Promise<Metadata> => {
  const document = await cmsClient
    .collection("api::overview-page.overview-page")
    .findOne(documentId, {
      fields: ["documentId"],
      populate: {
        seo: {
          populate: {
            openGraph: true,
          },
        },
      },
    });

  const { seo: metadata } = document.data;

  if (!metadata) {
    return {};
  }

  return {
    metadataBase: process.env.NEXT_PUBLIC_CMS_URL,
    title: metadata.metaTitle,
    description: metadata.metaDescription,
    keywords: metadata.keywords,
    viewport: metadata.metaViewport,
    robots: metadata.metaRobots,
    alternates: {
      canonical: metadata.canonicalURL,
    },
    openGraph: metadata.openGraph
      ? {
          title: metadata.openGraph.ogTitle || "",
          description: metadata.openGraph.ogDescription || "",
          url: metadata.openGraph.ogUrl || "",
          type: (metadata.openGraph.ogType as OpenGraphType) || "website",
          images: metadata.openGraph.ogImage
            ? [
                {
                  url: metadata.openGraph.ogImage.url,
                  alt: metadata.openGraph.ogImage.alternativeText,
                },
              ]
            : undefined,
        }
      : {},
  };
};

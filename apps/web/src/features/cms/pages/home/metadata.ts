import type { Metadata } from "next";
import type { OpenGraphType } from "next/dist/lib/metadata/types/opengraph-types";
import { buildOgImageUrl } from "@/features/cms/lib/og-image-url";
import { cmsClient } from "@/features/cms/lib/strapi";

export const homeMetadata = async (): Promise<Metadata> => {
  const document = await cmsClient.single("api::home.home").find({
    fields: ["title"],
    populate: {
      seo: {
        populate: {
          openGraph: true,
        },
      },
    },
  });

  const { title, seo: metadata } = document.data;

  const webUrl =
    process.env.NEXT_PUBLIC_WEB_URL ?? "https://community.strapi.io";
  const pageTitle = metadata?.metaTitle ?? title;
  const pageDescription = metadata?.metaDescription ?? undefined;
  const ogImageUrl = buildOgImageUrl(webUrl, {
    name: pageTitle ?? "",
    type: "Community",
    description: pageDescription,
  });

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: metadata?.keywords,
    viewport: metadata?.metaViewport,
    robots: metadata?.metaRobots,
    alternates: {
      canonical: metadata?.canonicalURL,
    },
    openGraph: metadata?.openGraph
      ? {
          title: metadata.openGraph.ogTitle || pageTitle || "",
          description:
            metadata.openGraph.ogDescription || pageDescription || "",
          url: metadata.openGraph.ogUrl || "",
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

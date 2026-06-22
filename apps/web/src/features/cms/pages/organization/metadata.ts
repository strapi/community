import type { Metadata } from "next";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import { buildOgImageUrl } from "@/features/cms/lib/og-image-url";
import { cmsClient } from "@/features/cms/lib/strapi";

export const organizationMetadata = async (
  documentId: string,
): Promise<Metadata> => {
  const document = await cmsClient
    .collection("plugin::better-auth.organization")
    .findOne(documentId, {
      populate: { url_alias: true },
    });

  const { name, metadata: bio } = document.data as {
    name?: string | null;
    metadata?: string | null;
    logo?: string | null;
  } & Record<string, unknown>;
  const logo = (document.data as Record<string, unknown>).logo as
    | string
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

  const logoUrl = logo
    ? logo.startsWith("http")
      ? logo
      : cmsImageUrl(logo)
    : undefined;
  const ogImageUrl = buildOgImageUrl(webUrl, {
    name: name ?? "",
    type: "Organization",
    icon: logoUrl,
    description: bio ?? undefined,
  });

  return {
    title: name,
    description: bio,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: name ?? undefined,
      description: bio ?? undefined,
      type: "website",
      url: pageUrl,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: name ?? "" }],
    },
    twitter: {
      card: "summary_large_image",
      title: name ?? undefined,
      description: bio ?? undefined,
      images: [ogImageUrl],
    },
  };
};

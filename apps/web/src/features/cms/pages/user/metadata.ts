import type { Metadata } from "next";
import { buildOgImageUrl } from "@/features/cms/lib/og-image-url";
import { cmsClient } from "@/features/cms/lib/strapi";

export const userMetadata = async (id: string): Promise<Metadata> => {
  const document = await cmsClient
    .collection("plugin::better-auth.user")
    .findOne(id, {
      populate: {
        profile: true,
        url_alias: true,
      },
    });

  const { name, image, profile } = document.data as {
    name?: string | null;
    image?: string | null;
    profile?: { bio?: string | null } | null;
  } & Record<string, unknown>;
  const urlAlias = (document.data as Record<string, unknown>).url_alias as
    | { url_path?: string }[]
    | null
    | undefined;

  const description = profile?.bio ?? undefined;
  const webUrl =
    process.env.NEXT_PUBLIC_WEB_URL ?? "https://community.strapi.io";
  const pageUrl = urlAlias?.[0]?.url_path
    ? `${webUrl}${urlAlias[0].url_path}`
    : undefined;
  const ogImageUrl = buildOgImageUrl(webUrl, {
    name: name ?? "",
    type: "Member",
    icon: image ?? undefined,
    description,
  });

  return {
    title: name,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: name ?? undefined,
      description,
      type: "profile",
      url: pageUrl,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: name ?? "" }],
    },
    twitter: {
      card: "summary_large_image",
      title: name ?? undefined,
      description,
      images: [ogImageUrl],
    },
  };
};

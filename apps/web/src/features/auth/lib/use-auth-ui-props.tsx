"use client";

import type { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import { cn } from "@/lib/utils";
import { deleteAvatar, uploadAvatar } from "./avatar";
import { authClient } from "./client";
import {
  deleteOrganizationLogo,
  uploadOrganizationLogo,
} from "./organization-logo";

/**
 * The shared <AuthUIProvider> config, factored out so a route that needs
 * to override just one setting can nest a second provider without its
 * config drifting out of sync with this one.
 */
export function useAuthUIProviderProps(): Omit<
  ComponentProps<typeof AuthUIProvider>,
  "children"
> {
  const router = useRouter();

  return {
    authClient,
    navigate: (href) => router.push(href),
    replace: (href) => router.replace(href),
    Link: ({ href, ...props }) => <Link href={href ?? "#"} {...props} />,
    basePath: "/auth",
    baseURL: process.env.NEXT_PUBLIC_WEB_URL,
    account: true,
    avatar: {
      upload: uploadAvatar,
      delete: deleteAvatar,
      Image: ({ src, alt, className, ...props }) => {
        // Unlike Radix's own AvatarImage (which only mounts the <img>
        // once a src successfully loads), better-auth-ui renders a
        // custom `avatar.Image` unconditionally — including with an
        // empty src when the user has no avatar. Bail out so no <img>
        // ends up in the DOM and the fallback initials show instead.
        if (!src) return null;

        return (
          // better-auth-ui renders this in place of Radix's AvatarImage
          // (which normally gets `aspect-square size-full` to fill the
          // circular container) — replicate that here with `fill`
          // instead of a fixed width/height, or the image only covers a
          // small, badly-positioned box inside the avatar circle.
          <Image
            src={cmsImageUrl(src)}
            alt={alt}
            fill
            sizes="128px"
            className={cn("object-cover", className)}
            {...props}
          />
        );
      },
    },
    magicLink: true,
    social: {
      providers: ["google", "github"],
    },
    twoFactor: ["otp", "totp"],
    organization: {
      basePath: "/org",
      pathMode: "slug",
      personalPath: "/account",
      logo: {
        upload: uploadOrganizationLogo,
        delete: deleteOrganizationLogo,
      },
    },
  };
}

"use client";

import type { AuthUIProvider } from "@daveyplate/better-auth-ui";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
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
    // Where to send the user after a successful sign-in/sign-up (and other
    // post-auth flows like accepting an invitation) — defaults to "/"
    // otherwise. Account settings is the more useful landing spot here.
    redirectTo: "/account",
    // `slug` renders as an extra "Profile URL" card in the Settings tab,
    // right after the built-in avatar/name/email cards (better-auth-ui's
    // `AccountSettingsCards` always renders those first, then walks
    // `account.fields` for anything else matching `additionalFields`
    // below) — mirrors how an organization's own `slug` already shows up
    // in its management section, just via a custom field instead of a
    // native better-auth one.
    account: { fields: ["image", "name", "slug"] },
    additionalFields: {
      slug: {
        label: "Slug URL",
        description: "This is your profile's URL namespace.",
        placeholder: "your-name",
        required: true,
        instructions: "Changing this will update your profile URL.",
        type: "string",
        validate: async (value) =>
          value.length >= 3 &&
          value.length <= 60 &&
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
        errorMessage: {
          required: "Slug URL is required",
          validate:
            "Only lowercase letters, numbers, and hyphens (3–60 characters).",
        },
      },
    },
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

        const resolvedSrc = cmsImageUrl(src);

        return (
          <>
            {/*
             * better-auth-ui's <UserAvatar> always renders a Radix
             * <AvatarFallback> alongside `avatar.Image`, and Radix only
             * hides that fallback once its *own* <AvatarImage> reports
             * the image as loaded — a status it tracks on the shared
             * Avatar context. Since we render next/image below instead
             * of Radix's <AvatarImage>, that context never learns the
             * avatar loaded, so the fallback initials stayed visible
             * behind every uploaded avatar. This unrendered-but-mounted
             * AvatarImage does the real Radix load tracking (it uses an
             * offscreen Image object internally, so `hidden` here is
             * safe) purely to flip that context so the fallback
             * disappears; the actual visible avatar is still the
             * next/image below.
             */}
            <AvatarPrimitive.Image src={resolvedSrc} hidden />
            {/* better-auth-ui renders this in place of Radix's AvatarImage
                (which normally gets `aspect-square size-full` to fill the
                circular container) — replicate that here with `fill`
                instead of a fixed width/height, or the image only covers a
                small, badly-positioned box inside the avatar circle. */}
            <Image
              src={resolvedSrc}
              alt={alt}
              fill
              sizes="128px"
              className={cn("object-cover", className)}
              {...props}
            />
          </>
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

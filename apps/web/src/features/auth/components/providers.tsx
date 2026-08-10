"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import { cn } from "@/lib/utils";
import { deleteAvatar, uploadAvatar } from "../lib/avatar";
import { authClient } from "../lib/client";

export function AuthProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={(href) => router.push(href)}
      replace={(href) => router.replace(href)}
      Link={({ href, ...props }) => <Link href={href ?? "#"} {...props} />}
      basePath="/auth"
      baseURL={process.env.NEXT_PUBLIC_WEB_URL}
      account
      avatar={{
        upload: uploadAvatar,
        delete: deleteAvatar,
        Image: ({ src, alt, className, ...props }) => {
          if (!src) return null;

          return (
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
      }}
      emailOTP
      passkey
      social={{
        providers: ["google", "github"],
      }}
      emailVerification={{
        otp: true,
      }}
      twoFactor={["totp"]}
      organization={{
        basePath: "/org",
        pathMode: "slug",
        personalPath: "/account",
      }}
    >
      {children}
    </AuthUIProvider>
  );
}

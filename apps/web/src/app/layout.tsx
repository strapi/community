import "./globals.css";
import { StrapiFooter, StrapiNavbar } from "@repo/strapi-ui";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProviders } from "@/features/auth/components/providers";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_WEB_URL ?? "https://community.strapi.io",
  ),
  title: {
    template: "%s | Strapi Community",
    default: "Strapi Community",
  },
  description:
    "Discover plugins, templates, and integrations for Strapi — built by the community.",
  openGraph: {
    siteName: "Strapi Community",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <>
      <StrapiNavbar />
      {children}
      <div className="border-t border-(--color-neutral300)" />
      <StrapiFooter />
    </>
  );

  return (
    <html lang="en">
      <body
        className={`antialiased ${poppins.className}`}
        suppressHydrationWarning
      >
        {isAuthEnabled ? <AuthProviders>{content}</AuthProviders> : content}
        {isAuthEnabled && (
          <Toaster
            richColors
            closeButton
            position="top-right"
            toastOptions={{
              style: {
                fontSize: "0.95rem",
                fontWeight: 500,
                padding: "16px 20px",
                border: "1.5px solid",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
              },
              classNames: {
                closeButton: "toast-close-btn",
              },
            }}
            style={{ "--width": "420px" } as React.CSSProperties}
          />
        )}
      </body>
    </html>
  );
}

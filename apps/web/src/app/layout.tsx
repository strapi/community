import "./globals.css";
import { StrapiFooter, StrapiNavbar } from "@repo/strapi-ui";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProviders } from "@/features/auth/components/providers";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";

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
        {isAuthEnabled && <Toaster />}
      </body>
    </html>
  );
}

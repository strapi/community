"use client";

import "./globals.css";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  return (
    <html lang="en">
      <body className={`antialiased`} suppressHydrationWarning>
        <nav className="border-b border-(--color-hero-border) bg-(--color-hero-bg)">
          <Container className="flex h-16 items-center justify-between">
            <Link href="/">
              <Image
                src="/logo.svg"
                width={211}
                height={34}
                alt="Strapi Market logo"
                priority={true}
              />
            </Link>
            <button
              type="button"
              onClick={() => router.push("https://strapi.io")}
              className="rounded-md border border-(--color-hero-button-border) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-hero-button-hover)"
            >
              Go back to the website
            </button>
          </Container>
        </nav>

        {children}
      </body>
    </html>
  );
}

"use client";

import "./globals.css";

import {
  Button,
  DesignSystemProvider,
  Flex,
  Grid,
  lightTheme,
} from "@strapi/design-system";
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
        <DesignSystemProvider
          locale="en-GB"
          theme={{
            ...lightTheme,
            fontSizes: [
              `1.2rem`,
              `1.4rem`,
              `1.6rem`,
              "1.6rem",
              `1.8rem`,
              `3.2rem`,
            ],
            lineHeights: [1.14, 1.22, 1.25, 1.33, 1.43, 1.45, 1.5],
          }}
        >
          <nav>
            <Container>
              <Grid.Item col={6}>
                <Link href="/">
                  <Image
                    src="/logo.svg"
                    width={211}
                    height={34}
                    alt="Strapi Market logo"
                    priority={true}
                  />
                </Link>
              </Grid.Item>
              <Grid.Item col={6}>
                <Flex justifyContent={"flex-end"} width={"100%"}>
                  <Button onClick={() => router.push(`https://strapi.io`)}>
                    Go back to the website
                  </Button>
                </Flex>
              </Grid.Item>
            </Container>
          </nav>

          {children}
        </DesignSystemProvider>
      </body>
    </html>
  );
}

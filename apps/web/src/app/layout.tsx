"use client";

import "./globals.css";

import MainNavigation from "@/components/MainNavigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`} suppressHydrationWarning>
        <MainNavigation />

        {children}
      </body>
    </html>
  );
}

import { Navigation } from "@/components/layout/navigation";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`} suppressHydrationWarning>
        <Navigation />

        {children}
      </body>
    </html>
  );
}

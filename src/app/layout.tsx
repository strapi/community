import './globals.css';

import Layout from './ui/layout';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning={true}>
      <body className={`antialiased`}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}

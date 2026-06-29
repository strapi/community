const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;
const IsDEV = CMS_URL.startsWith("http://localhost");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    authInterrupts: true,
  },
  productionBrowserSourceMaps: true,
  images: {
    dangerouslyAllowLocalIP: IsDEV,
    remotePatterns: [
      // Local development
      {
        protocol: "http",
        hostname: "localhost",
      },
      // Strapi Cloud
      {
        protocol: "https",
        hostname: "**.strapiapp.com",
      },
    ],
  },
};

export default nextConfig;

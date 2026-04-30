const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;
const IsDEV = CMS_URL.startsWith("http://localhost");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowLocalIP: IsDEV,
    remotePatterns: [
      // Local development
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/uploads/**",
      },
      // Strapi Cloud
      {
        protocol: "https",
        hostname: "**.strapiapp.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;

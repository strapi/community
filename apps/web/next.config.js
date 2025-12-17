const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;
const IsDEV = CMS_URL.startsWith("http://localhost");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowLocalIP: IsDEV,
    remotePatterns: [
      {
        protocol: IsDEV ? "http" : "https",
        hostname: new URL(CMS_URL).hostname,
      },
    ],
  },
};

export default nextConfig;

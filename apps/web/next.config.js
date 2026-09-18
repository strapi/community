const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;
const IsDEV = CMS_URL.startsWith("http://localhost");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    authInterrupts: true,
  },
  // isomorphic-dompurify pulls in jsdom -> undici, which imports
  // `node:worker_threads`. Turbopack's Node File Trace step can't handle
  // that node: import when tracing the serverless output and fails the
  // build (TurbopackInternalError: NftJsonAsset: cannot handle filepath
  // node:worker_threads). This is only ever used server-side (see
  // features/submit/server/sanitize-svg.ts), so exclude it from
  // bundling/tracing and let Node `require` it at runtime instead.
  serverExternalPackages: ["isomorphic-dompurify"],
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

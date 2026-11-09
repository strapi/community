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
  //
  // It's pinned to ~2.26 (jsdom 26) in package.json: jsdom 27+ pulls in
  // html-encoding-sniffer 6, which `require()`s the ESM-only @exodus/bytes.
  // That relies on Node's require(esm) support, which the Vercel function
  // runtime doesn't provide, so the route fails with ERR_REQUIRE_ESM.
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
      // Google social auth
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      // Github social auth
      {
        protocol: "https",
        hostname: "**.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;

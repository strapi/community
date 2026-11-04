import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Strapi Community",
    short_name: "Strapi Community",
    description:
      "Discover plugins, templates and integrations for Strapi, built by the community.",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#4945FF",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

export type PackageDownloads = {
  weekly: number | null;
  monthly: number | null;
  total: number | null;
};

export type PackageInfo = {
  registry: string;
  packageName: string;
  version: string;
  publishedAt: string | null;
  description: string | null;
  installCommand: string | null;
  downloads: PackageDownloads | null;
  stars: number | null;
  /** Only available for npm packages that declare a Strapi peer dependency */
  strapiPeerDependency: string | null;
};

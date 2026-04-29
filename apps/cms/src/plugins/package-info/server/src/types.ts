export interface RegistryDownloads {
  weekly: number | null;
  monthly: number | null;
  total: number | null;
}

export interface RegistryInfo {
  registry: string;
  packageName: string;
  version: string | null;
  publishedAt: string | null;
  description: string | null;
  installCommand: string;
  downloads: RegistryDownloads;
  readme: string | null;
  stars: number | null;
}

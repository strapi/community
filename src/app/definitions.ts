export type Package = {
  name: string;
  description: string;
  icon: Asset;
  screenshots: Asset[];
  stars: number;
  downloads: number;
  npm_package: string;
  git_repository: string;
  version: string;
  type: string;
  categories: Category[];
  verified: boolean;
};

export type Category = {
  name: string;
  slug: string;
  plugins: Array<Package>;
};

interface Asset {
  alternativeText: string;
  createdAt: string;
  documentId: string;
  ext: string;
  formats: string | null;
  hash: string;
  height: number;
  id: number | string;
  locale: string | null;
  mime: string;
  name: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: string | null;
  publishedAt: string;
  size: number;
  updatedAt: string;
  url: string;
  width: number;
}

export type Package = {
  name: string;
  description: string;
  slug: string;
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
  updatedAt: string;
  publishedAt: string;
  author: User;
};

export type User = {
  username: string;
  email: string;
  trusted_partner: boolean;
  packages: Package[];
  slug: string;
  description: string;
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

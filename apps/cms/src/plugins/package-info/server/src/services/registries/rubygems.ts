import type { RegistryInfo } from "../../types";

export function extractRubyGemsPackageName(pathname: string): string | null {
  const match = pathname.match(/^\/gems\/([^/]+)/);
  return match?.[1] ?? null;
}

export async function getRubyGemsPackageInfo(
  packageName: string,
): Promise<RegistryInfo> {
  const res = await fetch(
    `https://rubygems.org/api/v1/gems/${packageName}.json`,
  );

  if (!res.ok) throw new Error(`RubyGems returned ${res.status}`);

  const data: any = await res.json();

  return {
    registry: "rubygems",
    packageName,
    version: data.version ?? null,
    publishedAt: data.version_created_at ?? null,
    description: data.info ?? null,
    installCommand: `gem install ${packageName}`,
    downloads: {
      weekly: null,
      monthly: null,
      total: data.downloads ?? null,
    },
    readme: null,
    stars: null,
  };
}

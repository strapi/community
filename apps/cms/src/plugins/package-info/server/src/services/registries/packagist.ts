import type { RegistryInfo } from "../../types";

export function extractPackagistPackageName(pathname: string): string | null {
  const match = pathname.match(/^\/packages\/([^/]+\/[^/]+)/);
  return match?.[1] ?? null;
}

export async function getPackagistPackageInfo(
  packageName: string,
): Promise<RegistryInfo> {
  const res = await fetch(`https://packagist.org/packages/${packageName}.json`);

  if (!res.ok) throw new Error(`Packagist returned ${res.status}`);

  const data: any = await res.json();
  const versions: Record<string, any> = data.package?.versions ?? {};

  const stable = Object.values(versions).find(
    (v) => !v.version.startsWith("dev-") && !v.version.includes("dev"),
  );

  if (!stable) throw new Error("No stable version found on Packagist");

  const dl = data.package?.downloads;

  return {
    registry: "packagist",
    packageName,
    version: stable.version.replace(/^v/, ""),
    publishedAt: stable.time ?? null,
    description: stable.description ?? null,
    installCommand: `composer require ${packageName}`,
    downloads: {
      weekly: null,
      monthly: dl?.monthly ?? null,
      total: dl?.total ?? null,
    },
    readme: null,
    stars: null,
  };
}

import type { RegistryInfo } from "../../types";

export function extractNugetPackageName(pathname: string): string | null {
  const match = pathname.match(/^\/packages\/([^/]+)/);
  return match?.[1] ?? null;
}

export async function getNugetPackageInfo(
  packageName: string,
): Promise<RegistryInfo> {
  const id = packageName.toLowerCase();

  const indexRes = await fetch(
    `https://api.nuget.org/v3-flatcontainer/${id}/index.json`,
  );

  if (!indexRes.ok) throw new Error(`NuGet returned ${indexRes.status}`);

  const index: any = await indexRes.json();
  const versions: string[] = index.versions ?? [];
  const latest = versions[versions.length - 1];

  if (!latest) throw new Error("NuGet package has no versions");

  const [leafRes, searchRes] = await Promise.all([
    fetch(`https://api.nuget.org/v3/registration5/${id}/${latest}.json`),
    fetch(
      `https://azuresearch-usnc.nuget.org/query?q=packageid:${encodeURIComponent(id)}&prerelease=false&take=1`,
    ),
  ]);

  let publishedAt: string | null = null;
  let description: string | null = null;
  let totalDownloads: number | null = null;

  if (leafRes.ok) {
    const leaf: any = await leafRes.json();
    publishedAt = leaf.published ?? null;
    description = leaf.catalogEntry?.description ?? null;
  }

  if (searchRes.ok) {
    const search: any = await searchRes.json();
    totalDownloads = search.data?.[0]?.totalDownloads ?? null;
  }

  return {
    registry: "nuget",
    packageName,
    version: latest,
    publishedAt,
    description,
    installCommand: `dotnet add package ${packageName}`,
    downloads: {
      weekly: null,
      monthly: null,
      total: totalDownloads,
    },
    readme: null,
    stars: null,
  };
}

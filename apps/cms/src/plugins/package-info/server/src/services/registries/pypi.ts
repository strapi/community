import type { RegistryInfo } from "../../types";

export function extractPypiPackageName(pathname: string): string | null {
  const match = pathname.match(/^\/project\/([^/]+)/);
  return match?.[1] ?? null;
}

export async function getPypiPackageInfo(
  packageName: string,
): Promise<RegistryInfo> {
  const [pypiRes, statsRes] = await Promise.all([
    fetch(`https://pypi.org/pypi/${packageName}/json`),
    fetch(
      `https://pypistats.org/api/packages/${packageName.toLowerCase()}/recent`,
    ),
  ]);

  if (!pypiRes.ok) throw new Error(`PyPI returned ${pypiRes.status}`);

  const data: any = await pypiRes.json();
  const version = data.info?.version ?? null;
  const urls = data.urls ?? [];
  const publishedAt = urls[0]?.upload_time_iso_8601 ?? null;

  const statsData: any = statsRes.ok ? await statsRes.json() : null;

  return {
    registry: "pypi",
    packageName,
    version,
    publishedAt,
    description: data.info?.summary ?? null,
    installCommand: `pip install ${packageName}`,
    downloads: {
      weekly: statsData?.data?.last_week ?? null,
      monthly: statsData?.data?.last_month ?? null,
      total: null,
    },
    readme: data.info?.description ?? null,
    stars: null,
  };
}

function extractPackagistPackageName(pathname) {
  const match = pathname.match(/^\/packages\/([^/]+\/[^/]+)/);
  return match?.[1] ?? null;
}

async function getPackagistPackageInfo(packageName) {
  const res = await fetch(`https://packagist.org/packages/${packageName}.json`);

  if (!res.ok) throw new Error(`Packagist returned ${res.status}`);

  const data = await res.json();
  const versions = data.package?.versions ?? {};

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
    stars: null,
  };
}

module.exports = { extractPackagistPackageName, getPackagistPackageInfo };

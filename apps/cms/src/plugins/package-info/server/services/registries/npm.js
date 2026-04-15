function extractNpmPackageName(pathname) {
  const match = pathname.match(/^\/package\/(@[^/]+\/[^/]+|[^/]+)/);
  return match?.[1] ?? null;
}

async function getNpmPackageInfo(packageName) {
  const encoded = encodeURIComponent(packageName);

  const [registryRes, weeklyRes, monthlyRes] = await Promise.all([
    fetch(`https://registry.npmjs.org/${packageName}`, {
      headers: { Accept: "application/json" },
    }),
    fetch(`https://api.npmjs.org/downloads/point/last-week/${encoded}`),
    fetch(`https://api.npmjs.org/downloads/point/last-month/${encoded}`),
  ]);

  if (!registryRes.ok)
    throw new Error(`npm registry returned ${registryRes.status}`);

  const data = await registryRes.json();
  const latest = data["dist-tags"]?.latest;
  const publishedAt = data.time?.[latest] ?? null;

  const weeklyData = weeklyRes.ok ? await weeklyRes.json() : null;
  const monthlyData = monthlyRes.ok ? await monthlyRes.json() : null;

  return {
    registry: "npm",
    packageName,
    version: latest,
    publishedAt,
    description: data.description ?? null,
    installCommand: `npm install ${packageName}`,
    downloads: {
      weekly: weeklyData?.downloads ?? null,
      monthly: monthlyData?.downloads ?? null,
      total: null,
    },
    stars: null,
  };
}

module.exports = { extractNpmPackageName, getNpmPackageInfo };

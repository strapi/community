function extractRubyGemsPackageName(pathname) {
  const match = pathname.match(/^\/gems\/([^/]+)/);
  return match?.[1] ?? null;
}

async function getRubyGemsPackageInfo(packageName) {
  const res = await fetch(
    `https://rubygems.org/api/v1/gems/${packageName}.json`,
  );

  if (!res.ok) throw new Error(`RubyGems returned ${res.status}`);

  const data = await res.json();

  return {
    registry: "rubygems",
    packageName,
    version: data.version,
    publishedAt: data.version_created_at ?? null,
    description: data.info ?? null,
    installCommand: `gem install ${packageName}`,
    downloads: {
      weekly: null,
      monthly: null,
      total: data.downloads ?? null,
    },
    stars: null,
  };
}

module.exports = { extractRubyGemsPackageName, getRubyGemsPackageInfo };

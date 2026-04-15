const {
  extractNpmPackageName,
  getNpmPackageInfo,
} = require("./registries/npm");
const {
  extractPypiPackageName,
  getPypiPackageInfo,
} = require("./registries/pypi");
const {
  extractRubyGemsPackageName,
  getRubyGemsPackageInfo,
} = require("./registries/rubygems");
const {
  extractPackagistPackageName,
  getPackagistPackageInfo,
} = require("./registries/packagist");
const {
  extractNugetPackageName,
  getNugetPackageInfo,
} = require("./registries/nuget");
const { getGitStars } = require("./get-git-stars");

function normalizeUrl(raw) {
  let href = raw.trim();
  if (!/^https?:\/\//i.test(href)) href = `https://${href}`;
  try {
    return new URL(href);
  } catch {
    return null;
  }
}

async function getPackageInfo(packageLocation, gitRepositoryUrl) {
  const url = normalizeUrl(packageLocation);
  if (!url) return null;

  const hostname = url.hostname.replace(/^www\./i, "").toLowerCase();
  const pathname = url.pathname;

  try {
    let infoPromise = null;

    switch (hostname) {
      case "npmjs.com": {
        const name = extractNpmPackageName(pathname);
        if (!name) return null;
        infoPromise = getNpmPackageInfo(name);
        break;
      }
      case "pypi.org": {
        const name = extractPypiPackageName(pathname);
        if (!name) return null;
        infoPromise = getPypiPackageInfo(name);
        break;
      }
      case "rubygems.org": {
        const name = extractRubyGemsPackageName(pathname);
        if (!name) return null;
        infoPromise = getRubyGemsPackageInfo(name);
        break;
      }
      case "packagist.org": {
        const name = extractPackagistPackageName(pathname);
        if (!name) return null;
        infoPromise = getPackagistPackageInfo(name);
        break;
      }
      case "nuget.org": {
        const name = extractNugetPackageName(pathname);
        if (!name) return null;
        infoPromise = getNugetPackageInfo(name);
        break;
      }
      default:
        return null;
    }

    const [info, stars] = await Promise.all([
      infoPromise,
      gitRepositoryUrl ? getGitStars(gitRepositoryUrl) : Promise.resolve(null),
    ]);

    return { ...info, stars };
  } catch {
    return null;
  }
}

module.exports = { getPackageInfo };

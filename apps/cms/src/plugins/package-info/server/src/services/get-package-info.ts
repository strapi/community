import type { RegistryInfo } from "../types";
import { getGitStars } from "./get-git-stars";
import { getReadme } from "./get-readme";
import { extractNpmPackageName, getNpmPackageInfo } from "./registries/npm";
import {
  extractNugetPackageName,
  getNugetPackageInfo,
} from "./registries/nuget";
import {
  extractPackagistPackageName,
  getPackagistPackageInfo,
} from "./registries/packagist";
import { extractPypiPackageName, getPypiPackageInfo } from "./registries/pypi";
import {
  extractRubyGemsPackageName,
  getRubyGemsPackageInfo,
} from "./registries/rubygems";

function normalizeUrl(raw: string): URL | null {
  let href = raw.trim();
  if (!/^https?:\/\//i.test(href)) href = `https://${href}`;
  try {
    return new URL(href);
  } catch {
    return null;
  }
}

export async function getPackageInfo(
  packageLocation: string,
  gitRepositoryUrl?: string,
): Promise<RegistryInfo | null> {
  const url = normalizeUrl(packageLocation);
  if (!url) return null;

  const hostname = url.hostname.replace(/^www\./i, "").toLowerCase();
  const pathname = url.pathname;

  let infoPromise: Promise<RegistryInfo> | null = null;

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

  const readme =
    info.readme ??
    (gitRepositoryUrl ? await getReadme(gitRepositoryUrl) : null);

  return { ...info, stars, readme };
}

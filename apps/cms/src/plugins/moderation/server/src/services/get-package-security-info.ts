/**
 * Security-focused registry metadata fetcher.
 *
 * The package-info plugin already detects registry + fetches basic info
 * (version, downloads, description). This helper reuses its URL-extract
 * patterns but returns the additional fields needed for security scanning:
 * dependencies, scripts (especially install-time hooks), readme, declared
 * repository, and dist/tarball info.
 *
 * Registry support:
 *  - npm: fully implemented
 *  - packagist / pypi / rubygems / nuget: stubbed (notImplemented: true);
 *    downstream scan branches fall back to repo-only analysis.
 */

import { extractNpmPackageName } from "../../../../package-info/server/src/services/registries/npm";
import { extractNugetPackageName } from "../../../../package-info/server/src/services/registries/nuget";
import { extractPackagistPackageName } from "../../../../package-info/server/src/services/registries/packagist";
import { extractPypiPackageName } from "../../../../package-info/server/src/services/registries/pypi";
import { extractRubyGemsPackageName } from "../../../../package-info/server/src/services/registries/rubygems";

const INSTALL_SCRIPT_KEYS = ["preinstall", "install", "postinstall"];

function normalizeUrl(raw) {
  if (!raw) return null;
  let href = raw.toString().trim();
  if (!/^https?:\/\//i.test(href)) href = `https://${href}`;
  try {
    return new URL(href);
  } catch {
    return null;
  }
}

function detectRegistry(packageLocation) {
  const url = normalizeUrl(packageLocation);
  if (!url) return null;

  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  const path = url.pathname;

  switch (host) {
    case "npmjs.com": {
      const name = extractNpmPackageName(path);
      return name
        ? { registry: "npm", packageName: name, ecosystem: "npm" }
        : null;
    }
    case "pypi.org": {
      const name = extractPypiPackageName(path);
      return name
        ? { registry: "pypi", packageName: name, ecosystem: "PyPI" }
        : null;
    }
    case "rubygems.org": {
      const name = extractRubyGemsPackageName(path);
      return name
        ? { registry: "rubygems", packageName: name, ecosystem: "RubyGems" }
        : null;
    }
    case "packagist.org": {
      const name = extractPackagistPackageName(path);
      return name
        ? { registry: "packagist", packageName: name, ecosystem: "Packagist" }
        : null;
    }
    case "nuget.org": {
      const name = extractNugetPackageName(path);
      return name
        ? { registry: "nuget", packageName: name, ecosystem: "NuGet" }
        : null;
    }
    default:
      return null;
  }
}

async function fetchNpmSecurity(packageName: string) {
  const res = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(packageName)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) {
    return { available: false, reason: `npm registry returned ${res.status}` };
  }
  const data = (await res.json()) as Record<string, unknown> & {
    "dist-tags"?: { latest?: string };
    versions?: Record<string, Record<string, unknown>>;
    readme?: string;
  };
  const latestVersion = data["dist-tags"]?.latest;
  const versionMeta = data.versions?.[latestVersion];
  if (!versionMeta) {
    return { available: false, reason: "npm package has no latest version" };
  }

  const scripts = versionMeta.scripts || {};
  const installScripts: Record<string, string> = {};
  for (const key of INSTALL_SCRIPT_KEYS) {
    if (scripts[key]) installScripts[key] = scripts[key];
  }

  const repository = versionMeta.repository as
    | string
    | { url?: string }
    | undefined;
  const declaredRepository =
    typeof repository === "string" ? repository : repository?.url || null;

  const readme =
    (typeof data.readme === "string" && data.readme) ||
    (typeof versionMeta.readme === "string" && versionMeta.readme) ||
    null;

  return {
    available: true,
    version: latestVersion,
    dependencies: versionMeta.dependencies || {},
    peerDependencies: versionMeta.peerDependencies || {},
    scripts,
    installScripts,
    declaredRepository,
    readme,
    dist: versionMeta.dist || null,
  };
}

/**
 * Fetch security-relevant registry metadata for a published package.
 *
 * @param {string} packageLocation  The URL captured on the submission (e.g. https://www.npmjs.com/package/foo).
 * @returns {Promise<object|null>}  Null when the URL is not a supported registry or fails to resolve.
 *   When the URL resolves but the registry isn't fully implemented yet, returns
 *   `{ registry, packageName, ecosystem, available: false, notImplemented: true }`.
 */
async function getPackageSecurityInfo(packageLocation) {
  const detected = detectRegistry(packageLocation);
  if (!detected) return null;

  try {
    switch (detected.registry) {
      case "npm": {
        const info = await fetchNpmSecurity(detected.packageName);
        return { ...detected, ...info };
      }
      default:
        return {
          ...detected,
          available: false,
          notImplemented: true,
          reason: `Deep scan for ${detected.registry} is not yet implemented; falling back to repo-only analysis.`,
        };
    }
  } catch (err) {
    return {
      ...detected,
      available: false,
      reason: `Fetch failed: ${err.message}`,
    };
  }
}

export { detectRegistry, getPackageSecurityInfo };

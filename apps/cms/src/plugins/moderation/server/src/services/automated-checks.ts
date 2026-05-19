/**
 * Automated checks run at submission time.
 *
 * Supports GitHub and GitLab repositories. Provider is detected from the URL;
 * all check functions dispatch to the right API internally.
 *
 * Results are stored as JSON on the submission record in automated_check_results.
 *
 * `package_location` is a URL to the published package (npm / packagist / etc.).
 * Registry fallback lookups (for license / peer-dep checks) are npm-only for now;
 * when the URL is not an npm URL the fallback is skipped and the repo check stands alone.
 */

// ---------------------------------------------------------------------------
// URL / provider helpers
// ---------------------------------------------------------------------------

function parseUrl(raw) {
  let href = (raw || "").trim();
  if (!href) return null;
  if (!/^https?:\/\//i.test(href)) href = `https://${href}`;
  try {
    return new URL(href);
  } catch {
    return null;
  }
}

/**
 * Detect which Git provider hosts the repository and return structured info.
 *
 * Returns one of:
 *   { provider: 'github', owner, repo }
 *   { provider: 'gitlab', projectPath, encoded }   (encoded = URI-encoded path)
 *   { provider: 'unknown' }
 *   null  — if the URL is unparseable
 */
function parseRepoInfo(gitRepository) {
  const url = parseUrl(gitRepository);
  if (!url) return null;

  const hostname = url.hostname.replace(/^www\./i, "").toLowerCase();
  const cleanPath = url.pathname
    .replace(/^\//, "")
    .replace(/\.git$/, "")
    .replace(/\/$/, "");

  if (hostname === "github.com") {
    const parts = cleanPath.split("/");
    if (parts.length < 2 || !parts[0] || !parts[1]) return null;
    return { provider: "github", owner: parts[0], repo: parts[1] };
  }

  if (hostname === "gitlab.com" || hostname.endsWith(".gitlab.com")) {
    if (!cleanPath) return null;
    return {
      provider: "gitlab",
      projectPath: cleanPath,
      encoded: encodeURIComponent(cleanPath),
    };
  }

  return { provider: "unknown" };
}

// ---------------------------------------------------------------------------
// GitHub API helpers
// ---------------------------------------------------------------------------

function githubHeaders() {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function githubFetch(path) {
  return fetch(`https://api.github.com${path}`, { headers: githubHeaders() });
}

// ---------------------------------------------------------------------------
// GitLab API helpers
// ---------------------------------------------------------------------------

function gitlabHeaders() {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (process.env.GITLAB_TOKEN) {
    // GitLab supports both header styles; PRIVATE-TOKEN is more universally supported.
    headers["PRIVATE-TOKEN"] = process.env.GITLAB_TOKEN;
  }
  return headers;
}

async function gitlabFetch(path) {
  return fetch(`https://gitlab.com/api/v4${path}`, {
    headers: gitlabHeaders(),
  });
}

/**
 * Attempt to fetch a raw file from GitLab across common default branches.
 * Returns the Response if found, or null.
 */
async function gitlabRawFile(encoded, filePath) {
  const encodedFile = encodeURIComponent(filePath);
  const branches = ["main", "master", "HEAD"];
  for (const ref of branches) {
    try {
      const res = await gitlabFetch(
        `/projects/${encoded}/repository/files/${encodedFile}/raw?ref=${ref}`,
      );
      if (res.ok) return res;
    } catch {
      // try next ref
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Check: repository is public
// ---------------------------------------------------------------------------

async function checkRepoPublic(gitRepository) {
  const info = parseRepoInfo(gitRepository);

  if (!info) {
    return { passed: null, message: "Could not parse repository URL." };
  }

  if (info.provider === "github") {
    try {
      const res = await githubFetch(`/repos/${info.owner}/${info.repo}`);
      if (res.status === 404) {
        return {
          passed: false,
          message: "Repository not found or is private.",
        };
      }
      if (!res.ok) {
        return { passed: null, message: `GitHub API returned ${res.status}.` };
      }
      const data = (await res.json()) as { private: boolean };
      const isPublic = !data.private;
      return {
        passed: isPublic,
        message: isPublic ? "Repository is public." : "Repository is private.",
      };
    } catch (err) {
      return { passed: null, message: `GitHub check failed: ${err.message}` };
    }
  }

  if (info.provider === "gitlab") {
    try {
      const res = await gitlabFetch(`/projects/${info.encoded}`);
      if (res.status === 404) {
        return {
          passed: false,
          message: "Repository not found or is private.",
        };
      }
      if (!res.ok) {
        return { passed: null, message: `GitLab API returned ${res.status}.` };
      }
      const data = (await res.json()) as { visibility: string };
      const isPublic = data.visibility === "public";
      return {
        passed: isPublic,
        message: isPublic
          ? "Repository is public."
          : `Repository visibility is "${data.visibility}".`,
      };
    } catch (err) {
      return { passed: null, message: `GitLab check failed: ${err.message}` };
    }
  }

  return {
    passed: null,
    skipped: true,
    message: `Unsupported provider; manual check required.`,
  };
}

// ---------------------------------------------------------------------------
// Check: README exists
// ---------------------------------------------------------------------------

async function checkReadmeExists(gitRepository) {
  const info = parseRepoInfo(gitRepository);

  if (!info) {
    return { passed: null, message: "Could not parse repository URL." };
  }

  if (info.provider === "github") {
    try {
      const res = await githubFetch(`/repos/${info.owner}/${info.repo}/readme`);
      if (res.ok)
        return { passed: true, message: "README found in repository." };
      if (res.status === 404)
        return { passed: false, message: "No README found." };
      return { passed: null, message: `GitHub API returned ${res.status}.` };
    } catch (err) {
      return { passed: null, message: `GitHub check failed: ${err.message}` };
    }
  }

  if (info.provider === "gitlab") {
    // Try common README filenames
    const candidates = ["README.md", "README.rst", "README.txt", "README"];
    for (const name of candidates) {
      try {
        const res = await gitlabRawFile(info.encoded, name);
        if (res) return { passed: true, message: `README found (${name}).` };
      } catch {
        // continue
      }
    }
    return { passed: false, message: "No README found in repository root." };
  }

  return {
    passed: null,
    skipped: true,
    message: "Unsupported provider; manual check required.",
  };
}

// ---------------------------------------------------------------------------
// Fetch package.json (provider-aware)
// ---------------------------------------------------------------------------

async function fetchPackageJson(info) {
  if (info.provider === "github") {
    const branches = ["main", "master"];
    for (const branch of branches) {
      try {
        const res = await fetch(
          `https://raw.githubusercontent.com/${info.owner}/${info.repo}/${branch}/package.json`,
        );
        if (res.ok) return await res.json();
      } catch {
        // try next branch
      }
    }
    return null;
  }

  if (info.provider === "gitlab") {
    const res = await gitlabRawFile(info.encoded, "package.json");
    if (!res) return null;
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// package_location URL → npm name (used for registry fallback lookups below).
// Returns null for non-npm URLs; caller falls back to repo-only checks.
// ---------------------------------------------------------------------------

function extractNpmNameFromLocation(packageLocation) {
  if (!packageLocation) return null;
  let href = packageLocation.toString().trim();
  if (!/^https?:\/\//i.test(href)) href = `https://${href}`;
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.hostname.replace(/^www\./i, "").toLowerCase() !== "npmjs.com") {
    return null;
  }
  const match = url.pathname.match(/^\/package\/(@[^/]+\/[^/]+|[^/]+)/);
  return match?.[1] ?? null;
}

// ---------------------------------------------------------------------------
// Check: MIT license
// ---------------------------------------------------------------------------

async function checkMitLicense(gitRepository, npmPackageName) {
  const info = parseRepoInfo(gitRepository);
  let pkg = null;

  if (info && info.provider !== "unknown") {
    pkg = await fetchPackageJson(info);
  }

  // Fallback: npm registry
  if (!pkg && npmPackageName) {
    try {
      const res = await fetch(
        `https://registry.npmjs.org/${encodeURIComponent(npmPackageName)}/latest`,
      );
      if (res.ok) pkg = await res.json();
    } catch {
      // ignore
    }
  }

  if (!pkg) {
    return {
      passed: null,
      message: "Could not retrieve package.json to verify license.",
    };
  }

  const license = (pkg.license || "").toLowerCase().trim();
  const isMit = license === "mit";
  return {
    passed: isMit,
    message: isMit
      ? "License is MIT."
      : `License is "${pkg.license || "not specified"}"; MIT is required.`,
    detail: { license: pkg.license },
  };
}

// ---------------------------------------------------------------------------
// Check: Strapi peer dependency
// ---------------------------------------------------------------------------

async function checkStrapiPeerDep(gitRepository, npmPackageName) {
  const info = parseRepoInfo(gitRepository);
  let pkg = null;

  if (info && info.provider !== "unknown") {
    pkg = await fetchPackageJson(info);
  }

  if (!pkg && npmPackageName) {
    try {
      const res = await fetch(
        `https://registry.npmjs.org/${encodeURIComponent(npmPackageName)}/latest`,
      );
      if (res.ok) pkg = await res.json();
    } catch {
      // ignore
    }
  }

  if (!pkg) {
    return {
      passed: null,
      message: "Could not retrieve package.json to verify peer dependencies.",
    };
  }

  const peerDeps = pkg.peerDependencies || {};
  const hasStrapi = "@strapi/strapi" in peerDeps || "strapi" in peerDeps;
  return {
    passed: hasStrapi,
    message: hasStrapi
      ? "Strapi is listed as a peer dependency."
      : "Strapi is not listed as a peer dependency.",
    detail: { peerDependencies: peerDeps },
  };
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

async function runAutomatedChecks({ repository_url, package_location }) {
  const npmPackageName = extractNpmNameFromLocation(package_location);
  const [repoPublic, readmeExists, mitLicense, strapiPeerDep] =
    await Promise.allSettled([
      checkRepoPublic(repository_url),
      checkReadmeExists(repository_url),
      checkMitLicense(repository_url, npmPackageName),
      checkStrapiPeerDep(repository_url, npmPackageName),
    ]);

  const resolve = (settled) =>
    settled.status === "fulfilled"
      ? settled.value
      : { passed: null, message: settled.reason?.message || "Check error." };

  // Detect provider for the result metadata
  const info = parseRepoInfo(repository_url);
  const provider = info?.provider ?? "unknown";

  return {
    runAt: new Date().toISOString(),
    provider,
    checks: {
      repo_public: resolve(repoPublic),
      readme_exists: resolve(readmeExists),
      mit_license: resolve(mitLicense),
      strapi_peer_dep: resolve(strapiPeerDep),
      // Enterprise competition requires human review regardless of provider.
      enterprise_competition: {
        passed: null,
        skipped: true,
        message: "Requires manual business review.",
      },
    },
  };
}

export { runAutomatedChecks };

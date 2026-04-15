function normalizeUrl(raw) {
  let href = raw.trim();
  if (!/^https?:\/\//i.test(href)) href = `https://${href}`;
  try {
    return new URL(href);
  } catch {
    return null;
  }
}

async function getGitHubStars(pathname) {
  const parts = pathname
    .replace(/^\//, "")
    .replace(/\.git$/, "")
    .split("/");
  if (parts.length < 2) return null;

  const [owner, repo] = parts;
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers,
  });
  if (!res.ok) return null;

  const data = await res.json();
  return data.stargazers_count ?? null;
}

async function getGitLabStars(pathname) {
  const projectPath = pathname.replace(/^\//, "").replace(/\.git$/, "");
  if (!projectPath) return null;

  const encoded = encodeURIComponent(projectPath);
  const headers = {};
  if (process.env.GITLAB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITLAB_TOKEN}`;
  }

  const res = await fetch(`https://gitlab.com/api/v4/projects/${encoded}`, {
    headers,
  });
  if (!res.ok) return null;

  const data = await res.json();
  return data.star_count ?? null;
}

async function getGitStars(gitRepositoryUrl) {
  const url = normalizeUrl(gitRepositoryUrl);
  if (!url) return null;

  const hostname = url.hostname.replace(/^www\./i, "").toLowerCase();

  try {
    switch (hostname) {
      case "github.com":
        return await getGitHubStars(url.pathname);
      case "gitlab.com":
        return await getGitLabStars(url.pathname);
      default:
        return null;
    }
  } catch {
    return null;
  }
}

module.exports = { getGitStars };

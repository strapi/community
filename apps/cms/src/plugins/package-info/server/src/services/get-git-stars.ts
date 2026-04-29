function normalizeUrl(raw: string): URL | null {
  let href = raw.trim();
  if (!/^https?:\/\//i.test(href)) href = `https://${href}`;
  try {
    return new URL(href);
  } catch {
    return null;
  }
}

import { getGitHubHeaders, parseGitHubPathname } from "./github";

async function getGitHubStars(pathname: string): Promise<number | null> {
  const info = parseGitHubPathname(pathname);
  if (!info) return null;

  const { owner, repo } = info;

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: getGitHubHeaders(),
  });
  if (!res.ok) throw new Error(`Github returned ${res.status}`);

  const data: any = await res.json();
  return data.stargazers_count ?? null;
}

async function getGitLabStars(pathname: string): Promise<number | null> {
  const projectPath = pathname.replace(/^\//, "").replace(/\.git$/, "");
  if (!projectPath) return null;

  const encoded = encodeURIComponent(projectPath);
  const headers: Record<string, string> = {};
  if (process.env.GITLAB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITLAB_TOKEN}`;
  }

  const res = await fetch(`https://gitlab.com/api/v4/projects/${encoded}`, {
    headers,
  });
  if (!res.ok) throw new Error(`GitLab returned ${res.status}`);

  const data: any = await res.json();
  return data.star_count ?? null;
}

export async function getGitStars(
  gitRepositoryUrl: string,
): Promise<number | null> {
  const url = normalizeUrl(gitRepositoryUrl);
  if (!url) return null;

  const hostname = url.hostname.replace(/^www\./i, "").toLowerCase();

  switch (hostname) {
    case "github.com":
      return await getGitHubStars(url.pathname);
    case "gitlab.com":
      return await getGitLabStars(url.pathname);
    default:
      return null;
  }
}

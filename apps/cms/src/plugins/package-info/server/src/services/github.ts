export interface GitHubRepoInfo {
  owner: string;
  repo: string;
  subpath: string | null;
}

export function parseGitHubPathname(pathname: string): GitHubRepoInfo | null {
  const parts = pathname
    .replace(/^\//, "")
    .replace(/\.git$/, "")
    .split("/");
  if (parts.length < 2) return null;

  const [owner, repo, type, , ...rest] = parts;

  // /owner/repo/tree/{branch}/{subpath...} or /owner/repo/blob/{branch}/{file}
  const subpath =
    (type === "tree" || type === "blob") && rest.length > 0
      ? rest.join("/")
      : null;

  return { owner, repo, subpath };
}

export function getGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`;
  }
  return headers;
}

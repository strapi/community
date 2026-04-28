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

async function getGitHubReadme(pathname: string): Promise<string | null> {
  const info = parseGitHubPathname(pathname);
  if (!info) return null;

  const { owner, repo, subpath } = info;
  const endpoint = subpath
    ? `https://api.github.com/repos/${owner}/${repo}/readme/${subpath}`
    : `https://api.github.com/repos/${owner}/${repo}/readme`;

  const res = await fetch(endpoint, { headers: getGitHubHeaders() });
  if (!res.ok) throw new Error(`Github returned ${res.status}`);

  const data: any = await res.json();
  if (!data.content) return null;

  return Buffer.from(data.content, "base64").toString("utf-8");
}

async function getGitLabReadme(pathname: string): Promise<string | null> {
  const projectPath = pathname.replace(/^\//, "").replace(/\.git$/, "");
  if (!projectPath) return null;

  const encoded = encodeURIComponent(projectPath);
  const headers: Record<string, string> = {};
  if (process.env.GITLAB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITLAB_TOKEN}`;
  }

  const res = await fetch(
    `https://gitlab.com/api/v4/projects/${encoded}/repository/files/README.md/raw?ref=HEAD`,
    { headers },
  );
  if (!res.ok) throw new Error(`Gitlab returned ${res.status}`);

  return res.text();
}

async function getBitbucketReadme(pathname: string): Promise<string | null> {
  const parts = pathname
    .replace(/^\//, "")
    .replace(/\.git$/, "")
    .split("/");
  if (parts.length < 2) return null;

  const [workspace, repo] = parts;
  const headers: Record<string, string> = {};
  if (process.env.BITBUCKET_TOKEN) {
    headers.Authorization = `Bearer ${process.env.BITBUCKET_TOKEN}`;
  }

  const res = await fetch(
    `https://api.bitbucket.org/2.0/repositories/${workspace}/${repo}/src/HEAD/README.md`,
    { headers },
  );
  if (!res.ok) throw new Error(`Bitbucket returned ${res.status}`);

  return res.text();
}

async function getSourceForgeReadme(pathname: string): Promise<string | null> {
  // Handles both /projects/{project}/ and /p/{project}/ URL patterns
  const match = pathname.match(/^\/(projects|p)\/([^/]+)/);
  if (!match) return null;

  const project = match[2];

  const res = await fetch(
    `https://sourceforge.net/p/${project}/code/ci/HEAD/item/README.md?format=raw`,
  );
  if (!res.ok) throw new Error(`SourceForge returned ${res.status}`);

  return res.text();
}

export async function getReadme(
  gitRepositoryUrl: string,
): Promise<string | null> {
  const url = normalizeUrl(gitRepositoryUrl);
  if (!url) return null;

  const hostname = url.hostname.replace(/^www\./i, "").toLowerCase();

  switch (hostname) {
    case "github.com":
      return await getGitHubReadme(url.pathname);
    case "gitlab.com":
      return await getGitLabReadme(url.pathname);
    case "bitbucket.org":
      return await getBitbucketReadme(url.pathname);
    case "sourceforge.net":
      return await getSourceForgeReadme(url.pathname);
    default:
      return null;
  }
}

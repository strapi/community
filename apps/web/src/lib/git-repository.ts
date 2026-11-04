/**
 * Issue tracker URL for a package/template `git_repository`.
 *
 * The stored URL can point inside a monorepo (e.g.
 * `https://github.com/owner/repo/tree/main/packages/plugin`), so naively
 * appending `/issues` breaks. Reduce it to the repository root first.
 */
export function gitIssuesUrl(gitRepository: string): string {
  let href = gitRepository.trim();
  if (!/^https?:\/\//i.test(href)) href = `https://${href}`;

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return `${gitRepository.replace(/\/+$/, "")}/issues`;
  }

  const hostname = url.hostname.replace(/^www\./i, "").toLowerCase();
  const parts = url.pathname
    .replace(/\/+$/, "")
    .replace(/\.git$/, "")
    .split("/")
    .filter(Boolean);

  switch (hostname) {
    case "github.com":
    case "bitbucket.org":
      // /owner/repo[/tree|blob|src/...]
      if (parts.length >= 2) {
        return `${url.origin}/${parts[0]}/${parts[1]}/issues`;
      }
      break;
    case "gitlab.com": {
      // Projects can sit in nested groups; anything after `/-/` is a
      // location inside the project (/group/sub/project/-/tree/main/...).
      const separator = parts.indexOf("-");
      const project = separator === -1 ? parts : parts.slice(0, separator);
      if (project.length >= 2) {
        return `${url.origin}/${project.join("/")}/-/issues`;
      }
      break;
    }
  }

  return `${url.origin}${url.pathname.replace(/\/+$/, "")}/issues`;
}

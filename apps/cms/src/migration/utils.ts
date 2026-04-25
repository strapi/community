import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

export async function uploadFromUrl(url, fileName) {
  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  const tmpPath = path.join(os.tmpdir(), fileName);
  fs.writeFileSync(tmpPath, buffer);
  try {
    const uploadedFiles = await strapi
      .plugin("upload")
      .service("upload")
      .upload({
        data: {
          fileInfo: {
            name: fileName,
            alternativeText: "",
            caption: "",
          },
        },
        files: {
          filepath: tmpPath,
          name: fileName,
          mimetype: response.headers.get("content-type"),
          type: response.headers.get("content-type"),
          size: buffer.length,
        },
      });
    return uploadedFiles[0];
  } finally {
    fs.unlinkSync(tmpPath);
  }
}

export function getGithubOwnerAvatarUrl(repoUrl) {
  const match = repoUrl.match(/^https?:\/\/github\.com\/([^/]+)/);
  if (!match) return null;
  return {
    url: `https://github.com/${match[1].toLocaleLowerCase()}.png`,
    name: match[1].toLocaleLowerCase(),
  };
}

export async function uploadMarkdownImages(markdown: string): Promise<string> {
  const markdownImageRegex = /!\[([^\]]*)\]\((https?:\/\/[^)\s"]+)[^)]*\)/g;
  const htmlImageRegex = /<img[^>]+src="(https?:\/\/[^"]+)"[^>]*>/g;

  const urls = new Set<string>();
  for (const match of markdown.matchAll(markdownImageRegex)) {
    urls.add(match[2]);
  }
  for (const match of markdown.matchAll(htmlImageRegex)) {
    urls.add(match[1]);
  }

  const urlMap = new Map<string, string>();
  for (const url of urls) {
    try {
      const fileName = path.basename(new URL(url).pathname) || "image";
      const uploaded = await uploadFromUrl(url, fileName);
      if (uploaded?.url) {
        urlMap.set(url, uploaded.url);
      }
    } catch (e) {
      console.error(`Failed to upload markdown image: ${url}`, e);
    }
  }

  let result = markdown;
  for (const [oldUrl, newUrl] of urlMap) {
    result = result.replaceAll(oldUrl, newUrl);
  }

  return result;
}

export const generatePassword = () => {
  let length = 20,
    charset =
      "@#$&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$&*0123456789abcdefghijklmnopqrstuvwxyz",
    password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

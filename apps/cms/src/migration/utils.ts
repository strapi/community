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

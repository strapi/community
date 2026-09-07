import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

export async function uploadFile(
  filePath: string,
  fileName: string,
  mimeType: string,
) {
  const { size } = await fs.promises.stat(filePath);
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
        filepath: filePath,
        name: fileName,
        mimetype: mimeType,
        type: mimeType,
        size,
      },
    });
  return uploadedFiles[0];
}

export async function uploadFromUrl(url, fileName) {
  let response = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await fetch(url);
      if (response.ok) break;
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName}`;
  const tmpPath = path.join(os.tmpdir(), uniqueName);
  await fs.promises.writeFile(tmpPath, buffer);
  try {
    return await uploadFile(
      tmpPath,
      fileName,
      response.headers.get("content-type"),
    );
  } finally {
    await fs.promises.unlink(tmpPath);
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

import { getPluginService } from "../extensions/better-auth/utils";
import { getGithubOwnerAvatarUrl, uploadFromUrl } from "./utils";

const findLatestSubmission = async (userId: string) => {
  const userService = getPluginService("user");

  const [packages, templates] = await Promise.all([
    userService.getRelatedContent({
      organizationId: userId,
      uid: "api::package.package",
      query: {
        fields: ["git_repository", "createdAt"],
        sort: { createdAt: "desc" },
      },
    }),
    userService.getRelatedContent({
      organizationId: userId,
      uid: "api::template.template",
      query: {
        fields: ["git_repository", "createdAt"],
        sort: { createdAt: "desc" },
      },
    }),
  ]);

  return (
    [...packages, ...templates] as {
      git_repository?: string;
      createdAt: string;
    }[]
  )
    .filter((item) => item.git_repository)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
};

export const migrateUserProfilePictures = async () => {
  strapi.log.info("Starting user profile pictures migration...");
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  const users = await strapi.documents("plugin::better-auth.user").findMany({
    fields: ["id", "documentId", "image"],
    filters: {
      $or: [{ image: { $null: true } }, { image: { $eq: "" } }],
    },
  });

  for (const user of users) {
    try {
      const latestSubmission = await findLatestSubmission(String(user.id));

      const avatar = latestSubmission?.git_repository
        ? getGithubOwnerAvatarUrl(latestSubmission.git_repository)
        : null;

      if (!avatar) {
        skipped++;
        continue;
      }

      const uploadedAvatar = await uploadFromUrl(avatar.url, avatar.name);

      await strapi.documents("plugin::better-auth.user").update({
        documentId: user.documentId,
        data: {
          image: uploadedAvatar?.formats?.small?.url || uploadedAvatar?.url,
        },
      });
      migrated++;
    } catch (error) {
      failed++;
      strapi.log.error(
        `Error migrating profile picture for user ${user.documentId}:`,
        error,
      );
    }
  }

  strapi.log.info(
    `User profile pictures migration finished. Migrated: ${migrated}, Skipped: ${skipped}, Failed: ${failed}`,
  );
};

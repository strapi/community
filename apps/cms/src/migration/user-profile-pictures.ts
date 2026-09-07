import { getGithubOwnerAvatarUrl, uploadFromUrl } from "./utils";

const PACKAGE_UID = "api::package.package";
const TEMPLATE_UID = "api::template.template";

const findLatestPackage = (userDocumentId: string) =>
  strapi.documents(PACKAGE_UID).findFirst({
    fields: ["git_repository", "createdAt"],
    filters: {
      maintainers: { documentId: { $eq: userDocumentId } },
    },
    sort: { createdAt: "desc" },
  });

const findLatestTemplate = (userDocumentId: string) =>
  strapi.documents(TEMPLATE_UID).findFirst({
    fields: ["git_repository", "createdAt"],
    filters: {
      maintainers: { documentId: { $eq: userDocumentId } },
    },
    sort: { createdAt: "desc" },
  });

export const migrateUserProfilePictures = async () => {
  strapi.log.info("Starting user profile pictures migration...");
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  const users = await strapi.documents("plugin::better-auth.user").findMany({
    fields: ["documentId", "image"],
    filters: {
      $or: [{ image: { $null: true } }, { image: { $eq: "" } }],
    },
  });

  for (const user of users) {
    try {
      const [latestPackage, latestTemplate] = await Promise.all([
        findLatestPackage(user.documentId),
        findLatestTemplate(user.documentId),
      ]);

      const latestSubmission = [latestPackage, latestTemplate]
        .filter(Boolean)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];

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

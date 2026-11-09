import { migrateUserProfilePictures } from "./migration/user-profile-pictures";

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap() {
    if (process.env.ENABLE_MIGRATION !== "true") {
      return;
    }

    await migrateUserProfilePictures();
  },
};

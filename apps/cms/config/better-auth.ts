// @ts-expect-error
import { strapiAdapter } from "@strapi-community/plugin-better-auth/adapter";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

const auth = () => {
  // Skip Better Auth during the build process to avoid issues with missing environment variables
  if (process.env.npm_lifecycle_script === "strapi build") {
    return null;
  }

  return betterAuth({
    trustedOrigins: [process.env.WEBSITE_URL],
    secret: process.env.BETTER_AUTH_SECRET,
    plugins: [organization()],
    emailAndPassword: {
      enabled: true,
    },
    database: strapiAdapter({
      debugLogs:
        process.env.NODE_ENV === "development" &&
        process.env.ENABLE_MIGRATION !== "true",
    }),
    advanced: {
      database: {
        generateId: "serial",
      },
    },
  });
};

export default auth;

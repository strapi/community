// @ts-expect-error
import { strapiAdapter } from "@strapi-community/plugin-better-auth/adapter";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

const auth = () =>
  betterAuth({
    trustedOrigins: [process.env.WEBSITE_URL],
    secret: process.env.BETTER_AUTH_SECRET,
    plugins: [organization()],
    emailAndPassword: {
      enabled: true,
    },
    database: strapiAdapter({
      debugLogs: process.env.NODE_ENV === "development",
    }),
    advanced: {
      database: {
        generateId: "serial",
      },
    },
  });

export default auth;

// @ts-expect-error
import { strapiAdapter } from "@strapi-community/plugin-better-auth/adapter";
import { betterAuth } from "better-auth";

const auth = () =>
  betterAuth({
    trustedOrigins: [process.env.WEBSITE_URL],
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

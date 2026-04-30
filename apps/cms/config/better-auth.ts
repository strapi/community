import { dash } from "@better-auth/infra";
// @ts-expect-error
import { strapiAdapter } from "@strapi-community/plugin-better-auth";
import { betterAuth } from "better-auth";
import { emailOTP, organization, twoFactor } from "better-auth/plugins";
import {
  sendOtpEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "./better-auth-emails";

const auth = () => {
  // Skip Better Auth during the build process to avoid issues with missing environment variables
  if (process.env.npm_lifecycle_script === "strapi build") {
    return null;
  }

  return betterAuth({
    trustedOrigins: [process.env.WEBSITE_URL],
    secret: process.env.BETTER_AUTH_SECRET,
    appName: process.env.SITE_NAME ?? "Strapi Community",
    basePath: "/api/better-auth",
    plugins: [
      organization(),
      twoFactor({
        otpOptions: {
          sendOTP: async ({ user, otp }) => {
            await sendOtpEmail(user.email, otp);
          },
        },
      }),
      dash(),
      emailOTP({
        overrideDefaultEmailVerification: true,
        sendVerificationOTP: async ({ email, otp }) => {
          await sendOtpEmail(email, otp);
        },
      }),
    ],
    emailVerification: {
      sendOnSignIn: true,
    },
    emailAndPassword: {
      enabled: false,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        await sendResetPasswordEmail(user.email, url);
      },
    },
    database: strapiAdapter({
      debugLogs:
        process.env.BETTER_AUTH_DEBUG === "true" ||
        process.env.ENABLE_MIGRATION !== "true",
    }),
    advanced: {
      database: {
        generateId: "serial",
      },
      defaultCookieAttributes: {
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      },
    },
  });
};

export default auth;

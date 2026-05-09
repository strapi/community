import { dash } from "@better-auth/infra";
import { strapiAdapter } from "@strapi-community/plugin-better-auth";
import { betterAuth } from "better-auth";
import { emailOTP, organization, twoFactor } from "better-auth/plugins";
import { sendOtpEmail, sendResetPasswordEmail } from "./email";

export const auth = betterAuth({
  trustedOrigins: [process.env.WEBSITE_URL],
  secret: process.env.BETTER_AUTH_SECRET,
  appName: process.env.SITE_NAME ?? "Strapi Community",
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
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail(user.email, url);
    },
  },
  database: strapiAdapter({
    debugLogs:
      process.env.BETTER_AUTH_DEBUG === "true" &&
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

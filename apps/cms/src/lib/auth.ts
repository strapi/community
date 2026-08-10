import { dash } from "@better-auth/infra";
import { strapiAdapter } from "@strapi-community/plugin-better-auth";
import { betterAuth } from "better-auth";
import { jwt, magicLink, organization, twoFactor } from "better-auth/plugins";
import {
  sendChangeEmailConfirmationEmail,
  sendEmailChangedEmail,
  sendMagicLinkEmail,
  sendOrganizationInvitationEmail,
  sendOtpEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "./email";

const pendingEmailChanges = new Map<string, string>();

function absolutizeCallbackURL(url: string): string {
  const parsed = new URL(url);
  const callbackURL = parsed.searchParams.get("callbackURL");
  if (callbackURL && !/^https?:\/\//i.test(callbackURL)) {
    parsed.searchParams.set(
      "callbackURL",
      new URL(callbackURL, process.env.WEBSITE_URL).toString(),
    );
  }
  return parsed.toString();
}

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

function absolutizeMediaUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `${STRAPI_URL}${url}`;
}

export const auth = betterAuth({
  trustedOrigins: [process.env.WEBSITE_URL],
  secret: process.env.BETTER_AUTH_SECRET,
  appName: process.env.SITE_NAME ?? "Strapi Community",
  plugins: [
    organization({
      sendInvitationEmail: async (data) => {
        const url = `${process.env.WEBSITE_URL}/auth/accept-invitation?invitationId=${data.id}`;
        const expirationHours = Math.round(
          (new Date(data.invitation.expiresAt).getTime() - Date.now()) /
            (60 * 60 * 1000),
        );

        await sendOrganizationInvitationEmail(data.email, url, {
          inviterName: data.inviter.user.name,
          inviterEmail: data.inviter.user.email,
          organizationName: data.organization.name,
          organizationLogoURL: data.organization.logo
            ? absolutizeMediaUrl(data.organization.logo)
            : undefined,
          role: data.role,
          expirationHours,
        });
      },
    }),
    twoFactor({
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          await sendOtpEmail(user.email, otp);
        },
      },
    }),
    dash({
      apiUrl: STRAPI_URL,
      apiKey:
        process.env.BETTER_AUTH_DASHBOARD_SECRET ||
        "strapi-internal-dashboard-key",
    }),
    jwt(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail(email, absolutizeCallbackURL(url));
      },
    }),
  ],
  emailVerification: {
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, absolutizeCallbackURL(url));
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail(user.email, absolutizeCallbackURL(url));
    },
    onExistingUserSignUp: async ({ user }, request) => {
      await auth.api.signInMagicLink({
        body: { email: user.email },
        headers: request?.headers,
      });
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        pendingEmailChanges.set(newEmail, user.email);
        await sendChangeEmailConfirmationEmail(
          user.email,
          user.email,
          newEmail,
          absolutizeCallbackURL(url),
        );
      },
    },
  },
  databaseHooks: {
    user: {
      update: {
        after: async (updated) => {
          const oldEmail = pendingEmailChanges.get(updated.email);
          if (!oldEmail || !updated.emailVerified) return;
          pendingEmailChanges.delete(updated.email);
          await Promise.all([
            sendEmailChangedEmail(oldEmail, oldEmail, updated.email),
            sendEmailChangedEmail(updated.email, oldEmail, updated.email),
          ]);
        },
      },
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

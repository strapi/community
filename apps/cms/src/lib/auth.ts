import { dash } from "@better-auth/infra";
import { strapiAdapter } from "@strapi-community/plugin-better-auth";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { jwt, magicLink, organization, twoFactor } from "better-auth/plugins";
import {
  cascadeDeleteOrganization,
  cascadeDeleteUser,
} from "../extensions/better-auth/utils/cascade-delete";
import {
  generateUniqueUserSlug,
  isSlugTaken,
  validateSlug,
} from "../utils/slugify";
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

/**
 * The `dash` plugin below authenticates its dashboard-integration requests
 * by hashing this key (see `@better-auth/infra`'s dash plugin) — falling
 * back to a checked-in default here would mean anyone reading this
 * (now-public) source could compute a valid hash if the env var was ever
 * left unset in a real deployment. Fail closed instead.
 */
function requireDashboardSecret(): string {
  const secret = process.env.BETTER_AUTH_DASHBOARD_SECRET;
  if (!secret) {
    throw new Error(
      "BETTER_AUTH_DASHBOARD_SECRET must be set (no insecure default is used).",
    );
  }
  return secret;
}

function absolutizeMediaUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `${STRAPI_URL}${url}`;
}

/**
 * Re-links an uploaded logo file's `related` (the native polymorphic
 * field on `plugin::upload.file`) to the organization it now belongs to.
 *
 * At upload time (`uploadOwnedFile` in the better-auth extension), the
 * file can only be tagged to the *uploading user* — better-auth-ui's
 * `organization.logo.upload` callback has no organization id, since the
 * logo isn't attached to an org until this very update call. Once it is,
 * this re-tags the file so it's correctly related to the organization
 * instead. Runs on every organization update (not just logo changes),
 * which is harmless — it's a no-op when there's no logo, and idempotent
 * when the logo didn't change.
 */
async function relinkOrganizationLogo(organization: {
  id: string | number;
  logo?: string | null;
}) {
  if (!organization.logo) return;

  await strapi.db.query("plugin::upload.file").update({
    where: { url: organization.logo },
    data: {
      related: [
        {
          id: organization.id,
          __type: "plugin::better-auth.organization",
          __pivot: { field: "logo" },
        },
      ],
    },
  });
}

export const auth = betterAuth({
  /**
   * Social logins (Google/GitHub) are intentionally disabled: `socialProviders`
   * is opt-in in better-auth, so leaving it out means no OAuth provider is
   * registered and `/api/auth/sign-in/social` rejects every request. Sign-in is
   * email + password, magic link and 2FA only — the front-end mirrors this by
   * not passing `social` to <AuthUIProvider>
   * (apps/web/src/features/auth/lib/use-auth-ui-props.tsx).
   */
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
      organizationHooks: {
        afterUpdateOrganization: async ({ organization }) => {
          if (!organization) return;
          await relinkOrganizationLogo(organization);
        },
        /**
         * Cascade-deletes everything the organization owns (packages,
         * templates, showcases, its profile, its logo — see
         * `cascade-delete.ts`) before better-auth deletes the org's own
         * `member`/`invitation` rows and the organization itself.
         */
        beforeDeleteOrganization: async ({ organization }) => {
          await cascadeDeleteOrganization(organization.id);
        },
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
      apiKey: requireDashboardSecret(),
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
    deleteUser: {
      enabled: true,
      /**
       * Cascade-deletes everything the user owns (packages, templates,
       * showcases, their profile, their avatar — see `cascade-delete.ts`),
       * removes their membership from every organization, and fully
       * cascade-deletes any organization they own — before better-auth
       * deletes the user's own `session`/`account`/`user` rows.
       */
      beforeDelete: async (user) => {
        await cascadeDeleteUser(user.id);
      },
    },
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
    additionalFields: {
      /**
       * Determines the user's public profile URL (via the
       * `strapi-plugin-webtools` `/[slug]` pattern) independently of
       * `name` — see the account settings' "Profile URL" field
       * (apps/web/src/features/auth/lib/use-auth-ui-props.tsx). Not
       * `required` here, since that would also force it onto every
       * sign-up flow (social/magic link included) — it's populated by
       * `databaseHooks.user.create.before` below instead, and backfilled
       * for existing users by `migrateUserSlugs`.
       */
      slug: {
        type: "string",
        required: false,
        unique: true,
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: { slug: await generateUniqueUserSlug(user.name) },
        }),
      },
      update: {
        before: async (data, context) => {
          if (typeof data.slug !== "string") return;

          const slug = data.slug.trim();
          const formatError = validateSlug(slug);
          if (formatError) {
            throw new APIError("BAD_REQUEST", { message: formatError });
          }

          const currentUserId = context?.context?.session?.user?.id;
          if (await isSlugTaken(slug, { excludeUserId: currentUserId })) {
            throw new APIError("BAD_REQUEST", {
              message: "That profile URL is already taken.",
            });
          }

          return { data: { ...data, slug } };
        },
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
      sameSite: "lax",
    },
  },
});

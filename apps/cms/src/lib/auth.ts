import { dash } from "@better-auth/infra";
import { strapiAdapter } from "@strapi-community/plugin-better-auth";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import {
  admin,
  jwt,
  magicLink,
  organization,
  twoFactor,
} from "better-auth/plugins";
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
  absolutizeCallbackURL,
  absolutizeMediaUrl,
  assertLogoUsable,
  relinkOrganizationLogo,
  requireDashboardSecret,
  STRAPI_URL,
} from "./auth-helpers";
import {
  impersonationAdminUserIds,
  refreshImpersonationAdmins,
} from "./auth-impersonation";
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

export const auth = betterAuth({
  trustedOrigins: [process.env.WEBSITE_URL],
  secret: process.env.BETTER_AUTH_SECRET,
  appName: process.env.SITE_NAME ?? "Strapi Community Hub",
  /**
   * Where redirect-based flows (OAuth sign-in/linking callbacks, and
   * better-auth's own `/error` page) send the browser on failure. Without
   * this they fall back to `/api/auth/error` on the CMS, which in production
   * redirects to `/` — i.e. the Strapi admin login. The web app's
   * `/auth/error` view forwards the `?error=` code on to a page that toasts it.
   */
  onAPIError: {
    errorURL: `${process.env.WEBSITE_URL}/auth/error`,
  },
  account: {
    accountLinking: {
      disableImplicitLinking: true,
      allowDifferentEmails: true,
    },
  },
  // `prompt: "select_account"` makes Google/GitHub always show their account
  // picker instead of silently reusing whichever account is signed in there —
  // matters most when linking, where the wrong account is easy to pick up.
  socialProviders: {
    google: {
      clientId: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
      prompt: "select_account",
    },
    github: {
      clientId: process.env.BETTER_AUTH_GITHUB_CLIENT_ID,
      clientSecret: process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
      prompt: "select_account",
    },
  },
  plugins: [
    organization({
      schema: {
        organization: {
          additionalFields: {
            /**
             * Who may submit packages/templates on behalf of the
             * organization — only its owners/admins, or every member.
             * Set on the organization "Settings" tab (via better-auth's
             * own `organization.update`, which is already restricted to
             * owners/admins), enforced by `canSubmitForOrganization`.
             * `private` in the Strapi schema, so it stays off the public
             * content API. Existing organizations have no value, which
             * counts as `"admins"`.
             */
            submission_policy: {
              type: ["admins", "members"],
              required: false,
              defaultValue: "admins",
              input: true,
            },
          },
        },
      },
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
        beforeCreateOrganization: async ({ organization, user }) => {
          await assertLogoUsable(organization.logo, user.id);
        },
        beforeUpdateOrganization: async ({ organization, user, member }) => {
          await assertLogoUsable(
            organization.logo,
            user.id,
            member.organizationId,
          );
        },
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
        /**
         * Keep `impersonationAdminUserIds` in sync with org membership: any
         * member added/removed or role change could add or revoke someone's
         * impersonation access. Fires for every org (membership changes are
         * rare), and `refreshImpersonationAdmins` only ever reads the one
         * configured org, so a no-op recompute for other orgs is cheap.
         */
        afterAddMember: async () => {
          await refreshImpersonationAdmins();
        },
        afterRemoveMember: async () => {
          await refreshImpersonationAdmins();
        },
        afterUpdateMemberRole: async () => {
          await refreshImpersonationAdmins();
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
    /**
     * Provides the user-impersonation endpoints (`/api/auth/admin/
     * impersonate-user` + `/stop-impersonating`) and the session's
     * `impersonatedBy` field. Admins are identified natively via
     * `adminUserIds`, which we derive from the owner/admin members of the
     * Strapi team org — see `impersonationAdminUserIds` /
     * `refreshImpersonationAdmins`. We don't use the `role`-based model, so
     * no user ever needs role "admin".
     *
     * The plugin still contributes `role`/`banned`/`banReason`/`banExpires`
     * to the user content type and `impersonatedBy` to the session
     * (auto-synced by the better-auth adapter on startup); those are unused.
     */
    admin({
      adminUserIds: impersonationAdminUserIds,
      // Impersonation sessions last 1 hour by default; make it explicit.
      impersonationSessionDuration: 60 * 60,
    }),
    dash({
      apiUrl: STRAPI_URL,
      apiKey: requireDashboardSecret(),
    }),
    jwt(),
    magicLink({
      disableSignUp: true,
      /**
       * better-auth only enforces `disableSignUp` when the link is verified,
       * so skip sending to unknown emails here. The endpoint still responds
       * with success, so this doesn't reveal whether an account exists.
       */
      sendMagicLink: async ({ email, url }, ctx) => {
        const found = await ctx?.context.internalAdapter.findUserByEmail(email);
        if (!found) return;
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

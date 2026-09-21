import type {
  ChangeEmailConfirmationEmailProps,
  DeviceInfo,
  EmailChangedEmailProps,
  EmailVerificationEmailProps,
  MagicLinkEmailProps,
  NewDeviceEmailProps,
  OrganizationInvitationEmailProps,
  OtpEmailProps,
  PasswordChangedEmailProps,
  ResetPasswordEmailProps,
} from "@better-auth-ui/react/dist/email";
import { render, toPlainText } from "@react-email/render";
import React from "react";
import { AccountAccessEmail } from "./account-access-email";

type EmailComponents = {
  EmailVerificationEmail: (
    props: EmailVerificationEmailProps,
  ) => React.ReactElement;
  OtpEmail: (props: OtpEmailProps) => React.ReactElement;
  ResetPasswordEmail: (props: ResetPasswordEmailProps) => React.ReactElement;
  MagicLinkEmail: (props: MagicLinkEmailProps) => React.ReactElement;
  EmailChangedEmail: (props: EmailChangedEmailProps) => React.ReactElement;
  ChangeEmailConfirmationEmail: (
    props: ChangeEmailConfirmationEmailProps,
  ) => React.ReactElement;
  NewDeviceEmail: (props: NewDeviceEmailProps) => React.ReactElement;
  PasswordChangedEmail: (
    props: PasswordChangedEmailProps,
  ) => React.ReactElement;
  OrganizationInvitationEmail: (
    props: OrganizationInvitationEmailProps,
  ) => React.ReactElement;
};

// Native dynamic import avoids TypeScript compiling this to require(),
// which fails for ESM-only packages like @better-auth-ui/react. The email
// templates live under the package's dedicated `/email` subpath (as of
// 1.6.35) rather than its main entry, which now only exports client-side
// React hooks that don't belong in a server-only bundle.
const importEmailComponents = () =>
  new Function(
    "return import('@better-auth-ui/react/email')",
  )() as Promise<EmailComponents>;

const APP_NAME = process.env.SITE_NAME ?? "Strapi Community";
const LOGO_URL = "https://community.strapi.io/logo.svg";

async function sendEmail(
  to: string,
  subject: string,
  element: React.ReactElement,
): Promise<void> {
  if (process.env.ENABLE_MIGRATION === "true") {
    return;
  }
  const rawHtml = await render(element, { pretty: false });
  await strapi.plugins.email.services.email.send({
    to,
    subject,
    html: rawHtml,
    text: toPlainText(rawHtml),
  });
}

export async function sendVerificationEmail(
  to: string,
  url: string,
): Promise<void> {
  const { EmailVerificationEmail } = await importEmailComponents();
  await sendEmail(
    to,
    "Verify your email address",
    React.createElement(EmailVerificationEmail, {
      url,
      email: to,
      appName: APP_NAME,
      logoURL: LOGO_URL,
    }),
  );
}

export async function sendResetPasswordEmail(
  to: string,
  url: string,
): Promise<void> {
  const { ResetPasswordEmail } = await importEmailComponents();
  await sendEmail(
    to,
    "Reset your password",
    React.createElement(ResetPasswordEmail, {
      url,
      email: to,
      appName: APP_NAME,
      logoURL: LOGO_URL,
    }),
  );
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  options?: { subject?: string; expirationMinutes?: number },
): Promise<void> {
  const { OtpEmail } = await importEmailComponents();
  const {
    subject = "Your two-factor authentication code",
    expirationMinutes = 3,
  } = options ?? {};
  await sendEmail(
    to,
    subject,
    React.createElement(OtpEmail, {
      verificationCode: otp,
      email: to,
      appName: APP_NAME,
      logoURL: LOGO_URL,
      expirationMinutes,
    }),
  );
}

export async function sendMagicLinkEmail(
  to: string,
  url: string,
): Promise<void> {
  const { MagicLinkEmail } = await importEmailComponents();
  await sendEmail(
    to,
    "Your sign-in link",
    React.createElement(MagicLinkEmail, {
      url,
      email: to,
      appName: APP_NAME,
      logoURL: LOGO_URL,
    }),
  );
}

export async function sendChangeEmailConfirmationEmail(
  to: string,
  currentEmail: string,
  newEmail: string,
  url: string,
): Promise<void> {
  const { ChangeEmailConfirmationEmail } = await importEmailComponents();
  await sendEmail(
    to,
    "Confirm your email address change",
    React.createElement(ChangeEmailConfirmationEmail, {
      url,
      currentEmail,
      newEmail,
      appName: APP_NAME,
      logoURL: LOGO_URL,
    }),
  );
}

export async function sendEmailChangedEmail(
  to: string,
  oldEmail: string,
  newEmail: string,
  revertURL?: string,
): Promise<void> {
  const { EmailChangedEmail } = await importEmailComponents();
  await sendEmail(
    to,
    "Your email address has been changed",
    React.createElement(EmailChangedEmail, {
      oldEmail,
      newEmail,
      revertURL,
      appName: APP_NAME,
      logoURL: LOGO_URL,
    }),
  );
}

export async function sendNewDeviceEmail(
  to: string,
  deviceInfo: DeviceInfo,
): Promise<void> {
  const { NewDeviceEmail } = await importEmailComponents();
  await sendEmail(
    to,
    "New sign-in to your account",
    React.createElement(NewDeviceEmail, {
      userEmail: to,
      deviceInfo,
      appName: APP_NAME,
      logoURL: LOGO_URL,
    }),
  );
}

export async function sendOrganizationInvitationEmail(
  to: string,
  url: string,
  options: {
    inviterName?: string;
    inviterEmail?: string;
    organizationName?: string;
    organizationLogoURL?: string;
    role?: string;
    expirationHours?: number;
  },
): Promise<void> {
  const { OrganizationInvitationEmail } = await importEmailComponents();
  await sendEmail(
    to,
    options.organizationName
      ? `You've been invited to join ${options.organizationName}`
      : "You've been invited to join an organization",
    React.createElement(OrganizationInvitationEmail, {
      url,
      email: to,
      appName: APP_NAME,
      logoURL: LOGO_URL,
      ...options,
    }),
  );
}

export async function sendAccountAccessEmail(
  to: string,
  url: string,
): Promise<void> {
  await sendEmail(
    to,
    "You have an account on the Strapi Community Hub!",
    React.createElement(AccountAccessEmail, {
      url,
      email: to,
      appName: APP_NAME,
      logoURL: LOGO_URL,
    }),
  );
}

export async function sendPasswordChangedEmail(
  to: string,
  timestamp: string,
): Promise<void> {
  const { PasswordChangedEmail } = await importEmailComponents();
  await sendEmail(
    to,
    "Your password has been changed",
    React.createElement(PasswordChangedEmail, {
      email: to,
      timestamp,
      appName: APP_NAME,
      logoURL: LOGO_URL,
    }),
  );
}

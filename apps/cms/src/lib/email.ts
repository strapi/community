import type {
  DeviceInfo,
  EmailChangedEmailProps,
  EmailVerificationEmailProps,
  MagicLinkEmailProps,
  NewDeviceEmailProps,
  OtpEmailProps,
  PasswordChangedEmailProps,
  ResetPasswordEmailProps,
} from "@better-auth-ui/react";
import { render, toPlainText } from "@react-email/render";
import React from "react";

type EmailComponents = {
  EmailVerificationEmail: (
    props: EmailVerificationEmailProps,
  ) => React.ReactElement;
  OtpEmail: (props: OtpEmailProps) => React.ReactElement;
  ResetPasswordEmail: (props: ResetPasswordEmailProps) => React.ReactElement;
  MagicLinkEmail: (props: MagicLinkEmailProps) => React.ReactElement;
  EmailChangedEmail: (props: EmailChangedEmailProps) => React.ReactElement;
  NewDeviceEmail: (props: NewDeviceEmailProps) => React.ReactElement;
  PasswordChangedEmail: (
    props: PasswordChangedEmailProps,
  ) => React.ReactElement;
};

// Native dynamic import avoids TypeScript compiling this to require(),
// which fails for ESM-only packages like @better-auth-ui/react.
const importEmailComponents = () =>
  new Function(
    "return import('@better-auth-ui/react')",
  )() as Promise<EmailComponents>;

const APP_NAME = process.env.SITE_NAME ?? "Strapi Community";
const LOGO_URL = process.env.WEBSITE_URL
  ? `${process.env.WEBSITE_URL}/logo.svg`
  : undefined;

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
  expirationMinutes = 3,
): Promise<void> {
  const { OtpEmail } = await importEmailComponents();
  await sendEmail(
    to,
    "Your two-factor authentication code",
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

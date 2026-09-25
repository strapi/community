import { LogInIcon } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Navigation } from "@/components/layout/navigation";
import { AuthNotice } from "@/features/auth/components/auth-notice";
import { AuthView } from "@/features/auth/components/auth-view";
import { CheckEmailView } from "@/features/auth/components/check-email-view";
import { SignUpAuthView } from "@/features/auth/components/sign-up-auth-view";
import { TwoFactorAuthView } from "@/features/auth/components/two-factor-auth-view";
import { authClient } from "@/features/auth/lib/client";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";

type Props = {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<{ redirectTo?: string; email?: string }>;
};

// Keyed by `@daveyplate/better-auth-ui`'s default `authViewPaths` segments
// (see its `src/lib/view-paths.ts`). Not imported directly — that package's
// entry file is a "use client" boundary, so its exports can't be pulled into
// this server-only generateMetadata. The app doesn't override `viewPaths`
// anywhere (see auth-view/account-view/organization-view), so these literal
// segments stay in sync with the defaults it actually renders at.
const TITLES: Record<string, string> = {
  "sign-in": "Sign in",
  "sign-up": "Sign up",
  "forgot-password": "Forgot password",
  "reset-password": "Reset password",
  "two-factor": "Two-factor authentication",
  "magic-link": "Magic link",
  "email-otp": "Email OTP",
  "email-verification": "Verify email",
  "recover-account": "Recover account",
  "accept-invitation": "Accept invitation",
  "sign-out": "Sign out",
  callback: "Signing in",
  // Not a better-auth-ui view — our own screen, which our patch to its
  // sign-up and sign-in forms navigates to when the email isn't verified.
  "check-email": "Check your email",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const view = path.at(-1);

  return { title: (view && TITLES[view]) || TITLES["sign-in"] };
}

export default async function AuthPage({ params, searchParams }: Props) {
  if (!isAuthEnabled) notFound();

  const { path } = await params;
  const pathname = `/auth/${path.join("/")}`;
  const view = path.at(-1);

  // Only guard sign-in/sign-up — views like sign-out, callback, or
  // reset-password need to run their course even with a session. Checked
  // server-side (forwarding the incoming request's cookie to the CMS's
  // better-auth instance) so an already-authenticated visitor never sees
  // the form flash before being sent to their account settings.
  if (view === "sign-in" || view === "sign-up") {
    const { data: session } = await authClient.getSession({
      fetchOptions: { headers: await headers(), cache: "no-store" },
    });
    if (session) redirect("/account");
  }

  // better-auth-ui's `useAuthenticate()` bounces a logged-out visitor from
  // `/auth/accept-invitation` (or, for the submit forms, from `/submit/plugin`
  // and `/submit/template`) to this view with `redirectTo` pointing back at
  // wherever they came from, but does so silently — there's no visual sign
  // of *why* they landed here. Surface that context so it doesn't read like
  // a dead end.
  const { redirectTo, email } = await searchParams;
  // `check-email` keeps `redirectTo` (so the verification link lands in
  // the right place), but by then the visitor has already acted on that
  // context, so it no longer needs the notice.
  const showRedirectNotice = view !== "check-email";
  const isAcceptingInvitation =
    showRedirectNotice &&
    (redirectTo?.startsWith("/auth/accept-invitation") ?? false);
  const isSubmitting =
    showRedirectNotice && (redirectTo?.startsWith("/submit/") ?? false);

  return (
    <>
      <Navigation theme="light" />
      <main className="flex items-center justify-center px-4 py-12">
        {/* Shared `max-w-sm` wrapper — rather than each having its own, so
            the notice always lines up with the auth card's width (the
            card's own `max-w-sm` becomes a no-op inside an equally-wide
            parent) instead of the two drifting apart independently. */}
        <div className="flex w-full max-w-sm flex-col gap-4">
          {isAcceptingInvitation && (
            <AuthNotice icon={LogInIcon}>
              Sign in or create an account to accept your invitation.
            </AuthNotice>
          )}
          {isSubmitting && (
            <AuthNotice icon={LogInIcon}>
              Sign in or create an account to submit a plugin or template.
            </AuthNotice>
          )}
          {view === "check-email" ? (
            <CheckEmailView email={email} redirectTo={redirectTo} />
          ) : view === "sign-up" ? (
            <SignUpAuthView pathname={pathname} />
          ) : view === "two-factor" ? (
            <TwoFactorAuthView pathname={pathname} />
          ) : (
            <AuthView pathname={pathname} />
          )}
        </div>
      </main>
    </>
  );
}

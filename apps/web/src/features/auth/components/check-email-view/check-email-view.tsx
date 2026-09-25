"use client";

import { ArrowLeftIcon, Loader2Icon, MailCheckIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "../../lib/client";

const RESEND_COOLDOWN_SECONDS = 60;

type CheckEmailViewProps = {
  email?: string;
  redirectTo?: string;
};

/**
 * Where the visitor lands whenever better-auth has just emailed them a
 * verification link: after signing up (no session is handed back until
 * they verify), and after trying to sign in with an unverified address
 * (the CMS's `sendOnSignIn` sends a fresh link). Out of the box,
 * better-auth-ui only shows a toast in both cases, which is easy to miss.
 * Our patch (see `patches/@daveyplate__better-auth-ui@3.4.0.patch`) sends
 * them here instead, with `email` and any `redirectTo` in the query
 * string.
 *
 * better-auth-ui doesn't export its internal Card primitives, so the
 * markup below copies AuthView's card classes to match the other `/auth`
 * screens.
 */
export function CheckEmailView({ email, redirectTo }: CheckEmailViewProps) {
  // The verification email was sent right before we got here, so start
  // with the resend button on cooldown.
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timeout = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timeout);
  }, [cooldown]);

  const resend = async () => {
    if (!email) return;
    setIsResending(true);
    // Same callback URL the sign-up form uses, so the link in the resent
    // email lands in the same place as the one in the original email.
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: `${process.env.NEXT_PUBLIC_WEB_URL}${redirectTo || "/account"}`,
    });
    setIsResending(false);

    if (error) {
      toast.error(error.message || "Couldn't resend the verification email.");
      return;
    }
    toast.success("Verification email sent.");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const signInHref = `/auth/sign-in${
    redirectTo ? `?${new URLSearchParams({ redirectTo })}` : ""
  }`;

  return (
    <div className="flex w-full max-w-sm flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm">
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-(--color-primary100) text-(--color-primary600)">
          <MailCheckIcon className="size-6" aria-hidden="true" />
        </div>
        <h1 className="font-semibold text-lg leading-none md:text-xl">
          Check your email
        </h1>
        <p className="text-muted-foreground text-xs md:text-sm">
          We sent a verification link to{" "}
          {email ? (
            <span className="whitespace-nowrap font-medium text-foreground">
              {email}
            </span>
          ) : (
            "your email address"
          )}
          . Click the link in that email to activate your account.
        </p>
      </div>

      {email && (
        <div className="grid gap-2 px-6">
          <button
            type="button"
            onClick={resend}
            disabled={isResending || cooldown > 0}
            className="inline-flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border bg-background px-4 py-2 font-medium text-sm shadow-xs outline-none transition-all hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
          >
            {isResending && <Loader2Icon className="size-4 animate-spin" />}
            {cooldown > 0
              ? `Resend email in ${cooldown}s`
              : "Resend verification email"}
          </button>
          <p className="text-center text-muted-foreground text-xs">
            Can't find it? Check your spam folder.
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 px-6 text-muted-foreground text-sm">
        <ArrowLeftIcon className="size-3" aria-hidden="true" />
        <Link href={signInHref} className="text-foreground underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

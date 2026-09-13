import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Navigation } from "@/components/layout/navigation";
import { AuthView } from "@/features/auth/components/auth-view";
import { SignUpAuthView } from "@/features/auth/components/sign-up-auth-view";
import { TwoFactorAuthView } from "@/features/auth/components/two-factor-auth-view";
import { authClient } from "@/features/auth/lib/client";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";

type Props = {
  params: Promise<{ path: string[] }>;
};

export default async function AuthPage({ params }: Props) {
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

  return (
    <>
      <Navigation theme="light" />
      <main className="flex items-center justify-center px-4 py-12">
        {view === "sign-up" ? (
          <SignUpAuthView pathname={pathname} />
        ) : view === "two-factor" ? (
          <TwoFactorAuthView pathname={pathname} />
        ) : (
          <AuthView pathname={pathname} />
        )}
      </main>
    </>
  );
}

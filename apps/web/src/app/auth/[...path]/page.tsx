import { notFound } from "next/navigation";
import { Navigation } from "@/components/layout/navigation";
import { AuthView } from "@/features/auth/components/auth-view";
import { SignUpAuthView } from "@/features/auth/components/sign-up-auth-view";
import { TwoFactorAuthView } from "@/features/auth/components/two-factor-auth-view";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";

type Props = {
  params: Promise<{ path: string[] }>;
};

export default async function AuthPage({ params }: Props) {
  if (!isAuthEnabled) notFound();

  const { path } = await params;
  const pathname = `/auth/${path.join("/")}`;
  const view = path.at(-1);

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

import { notFound } from "next/navigation";
import { Navigation } from "@/components/layout/navigation";
import { AuthView } from "@/features/auth/components/auth-view";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";

type Props = {
  params: Promise<{ path: string[] }>;
};

export default async function AuthPage({ params }: Props) {
  if (!isAuthEnabled) notFound();

  const { path } = await params;
  const pathname = `/auth/${path.join("/")}`;

  return (
    <>
      <Navigation theme="light" />
      <main className="flex items-center justify-center px-4 py-12">
        <AuthView pathname={pathname} />
      </main>
    </>
  );
}

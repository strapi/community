import { notFound } from "next/navigation";
import { Navigation } from "@/components/layout/navigation";
import { AccountView } from "@/features/auth/components/account-view";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";

type Props = {
  params: Promise<{ path?: string[] }>;
};

export default async function AccountPage({ params }: Props) {
  if (!isAuthEnabled) notFound();

  const { path } = await params;
  const pathname = path ? `/account/${path.join("/")}` : "/account";

  return (
    <>
      <Navigation theme="light" />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AccountView pathname={pathname} />
      </main>
    </>
  );
}

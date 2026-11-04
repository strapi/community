import { Button, Container } from "@repo/strapi-ui";
import Link from "next/link";
import { AuthNavigation } from "@/features/auth/components/auth-navigation";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";
import { cmsClient } from "@/features/cms/lib/strapi";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

type Props = {
  theme: "light" | "dark";
};

const Navigation = async ({ theme }: Props) => {
  const data = await cmsClient.single("api::navigation.navigation").find({
    populate: "*",
  });

  const ctaLinks = data.data.cta_links?.map((link) => (
    <Button key={link.id} asChild>
      <Link href={link.link!}>{link.label}</Link>
    </Button>
  ));

  return (
    <nav
      className={`sticky z-11 top-0 border-b ${theme === "light" ? "border-(--color-neutral300)" : "border-(--color-grey700)"} ${theme === "light" ? "bg-(--background)" : "bg-(--color-hero-bg)"}`}
      style={{
        backgroundImage: `${theme === "light" ? "var(--bg-dotted-pattern-image-light)" : "var(--bg-dotted-pattern-image)"}`,
        backgroundSize: "var(--bg-dotted-pattern-size)",
      }}
    >
      <Container>
        <div
          className={`${theme === "light" ? "bg-(--background)" : "bg-(--color-hero-bg)"} flex h-18 items-center justify-between gap-8 border-x ${theme === "light" ? "border-(--color-neutral300)" : "border-(--color-grey700)"} px-4`}
        >
          <div className="flex items-center gap-8">
            {data.data.home_link && (
              <Link
                href={data.data.home_link.link!}
                className="rounded-sm bg-(--color-primary600) px-2 py-1 text-[13px] font-bold tracking-[0.08em] text-white uppercase"
              >
                {data.data.home_link.label}
              </Link>
            )}
            <NavLinks links={data.data.nav_links ?? []} theme={theme} />
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              {isAuthEnabled ? (
                <AuthNavigation
                  theme={theme}
                  compact
                  signedInActions={ctaLinks}
                />
              ) : (
                ctaLinks
              )}
            </div>
            <MobileNav
              navLinks={data.data.nav_links ?? []}
              ctaLinks={data.data.cta_links ?? []}
              theme={theme}
            />
          </div>
        </div>
      </Container>
    </nav>
  );
};

export { Navigation };

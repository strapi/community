"use server";

import { Button, Container } from "@repo/strapi-ui";
import { headers } from "next/headers";
import Link from "next/link";
import { cmsClient } from "@/features/cms/lib/strapi";

type Props = {
  theme: "light" | "dark";
};

const Navigation = async ({ theme }: Props) => {
  const data = await cmsClient.single("api::navigation.navigation").find({
    populate: "*",
  });

  const headersList = await headers();
  const path = new URL(headersList.get("x-url")!).pathname;

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
            <ul
              className={`hidden items-center gap-6 font-medium text-[15px] ${theme === "light" ? "text-(--color-primary700)" : "text-(--color-hero-muted)"} lg:flex`}
            >
              {data.data.nav_links?.map((link) => {
                const isActive =
                  path === link.link || path.startsWith(`${link.link}/`);

                return (
                  <li key={link.id}>
                    <Link
                      href={link.link!}
                      className={`transition-colors ${theme === "light" ? "hover:text-(--color-primary800)" : "hover:text-white"} ${isActive ? "text-white" : ""}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center gap-2">
            {data.data.cta_links?.map((link) => (
              <Button key={link.id} asChild>
                <Link href={link.link!}>{link.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </Container>
    </nav>
  );
};

export { Navigation };

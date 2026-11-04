"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkItem = {
  id: string | number;
  label?: string | null;
  link?: string | null;
};

type Props = {
  links: NavLinkItem[];
  theme: "light" | "dark";
};

// Client-side so the active state doesn't need request headers, which would
// opt every page that renders <Navigation> out of static rendering.
const NavLinks = ({ links, theme }: Props) => {
  const path = usePathname();

  return (
    <ul
      className={`hidden items-center gap-6 font-medium text-[15px] ${theme === "light" ? "text-(--color-primary700)" : "text-(--color-hero-muted)"} lg:flex`}
    >
      {links.map((link) => {
        const isActive = path === link.link || path.startsWith(`${link.link}/`);

        return (
          <li key={link.id}>
            <Link
              href={link.link!}
              className={`transition-colors ${theme === "light" ? "hover:text-(--color-primary800)" : "hover:text-white"} ${isActive ? (theme === "light" ? "text-(--color-primary900)" : "text-white") : ""}`}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export { NavLinks };

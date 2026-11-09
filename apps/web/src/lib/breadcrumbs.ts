export type Crumb = { label: string; href: string };

const slugToLabel = (slug: string) =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/** The breadcrumb trail for a pathname, starting at the home page. */
export function breadcrumbTrail(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);

  return [
    { label: "Strapi Community Hub", href: "/" },
    ...segments.map((segment, index) => ({
      label: slugToLabel(segment),
      href: `/${segments.slice(0, index + 1).join("/")}`,
    })),
  ];
}

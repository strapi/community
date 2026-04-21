import { fetchNavigation } from "../../api/fetch-navigation";
import { cn } from "../../utils/cn";
import { fetchGithubStars } from "../../utils/github-stars";
import { DesktopNavbar } from "./DesktopNavbar";
import { MobileNavbar } from "./MobileNavbar";

export async function StrapiNavbar({ className }: { className?: string }) {
  const data = await fetchNavigation();

  if (!data) return null;

  const githubStars = data.githubStars ? await fetchGithubStars() : null;

  return (
    <nav
      data-navbar
      className={cn(
        "relative sticky top-0 z-40 flex h-16 w-full items-center",
        "[animation:nav-scroll-detect_steps(1,end)_both]",
        "[animation-range:0px_1px]",
        "[animation-timeline:scroll()]",
        "[--nav-link-hover-initial:var(--color-strapi-blue-600)]",
        "[--nav-link-hover-scrolled:var(--color-strapi-blue-600)]",
        "[--nav-link-hover:var(--nav-link-hover-initial)]",
        "[--nav-logo-default-opacity:1]",
        "[--nav-logo-light-opacity:0]",
        "[--nav-text-initial:inherit]",
        "[--nav-text-scrolled:inherit]",
        "lg:h-20 lg:text-[var(--nav-text-initial)]",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <DesktopNavbar data={data} githubStars={githubStars} />
        <MobileNavbar data={data} />
      </div>
    </nav>
  );
}

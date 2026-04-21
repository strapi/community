import type { NavMenuLinkItem } from "../../types/navigation";
import { cn } from "../../utils/cn";
import { NavBasicImage } from "../../utils/image";
import { NavLink } from "../../utils/link";

interface NavMenuLinkProps {
  readonly component: NavMenuLinkItem | undefined | null;
  readonly className?: string;
}

export function NavMenuLink({ component, className }: NavMenuLinkProps) {
  if (!component) {
    return null;
  }

  let href = component.link?.href;
  if (!href) {
    return null;
  }

  if (href.startsWith("/")) {
    href = `${process.env.NEXT_PUBLIC_STRAPI_UI_URL}${href}`;
  }

  return (
    <NavLink
      href={href}
      target={component.link?.target}
      className={cn(
        "group/nav-link hover:bg-strapi-blue-100 rounded-strapi-lg flex h-auto flex-col items-start gap-1 whitespace-normal no-underline hover:no-underline md:px-5 md:py-2.5 lg:px-6 lg:py-5",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {component.icon?.media?.url && (
          <div className="relative size-5 shrink-0">
            <NavBasicImage image={component.icon.media} mode="fill" />
          </div>
        )}

        <p className="group-hover/nav-link:text-strapi-blue-500 text-foreground text-sm font-medium sm:text-lg">
          {component.link?.label}
        </p>
      </div>

      {component.description && (
        <p className="text-strapi-neutral-700 hidden text-xs sm:block">
          {component.description}
        </p>
      )}
    </NavLink>
  );
}

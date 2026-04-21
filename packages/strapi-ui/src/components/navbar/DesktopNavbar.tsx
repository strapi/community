import type { NavbarData } from "../../types/navigation";
import { cn } from "../../utils/cn";
import { GithubStarButton } from "../../utils/github-stars";
import { NavLinkImageComponent } from "../../utils/image";
import { NavLink } from "../../utils/link";
import {
  NavigationMenu,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuList,
} from "../ui/navigation-menu";
import { DirectNavItem } from "./DirectNavItem";
import { DropdownNavItem } from "./DropdownNavItem";

interface DesktopNavbarProps extends React.ComponentProps<"div"> {
  readonly data: NavbarData;
  readonly githubStars: number | null;
  readonly className?: string;
}

const logoClassName =
  "flex shrink-0 items-center p-0 [&_img]:!h-7 [&_img]:!w-auto xl:[&_img]:!h-8";

export function DesktopNavbar({
  data,
  githubStars,
  className,
  ...restProps
}: DesktopNavbarProps) {
  const { navItems, ctaLinks, bottomLinks, logoImage, logoImageLight } = data;

  return (
    <div
      className={cn("hidden items-center gap-3 lg:flex", className)}
      {...restProps}
    >
      <div className="relative shrink-0">
        {logoImage && (
          <NavLinkImageComponent
            component={logoImage}
            imageMode="responsive"
            transparentPlaceholder
            sizes="140px"
            className={cn(
              logoClassName,
              "opacity-[var(--nav-logo-default-opacity)] transition-opacity duration-300",
            )}
          />
        )}
        {logoImageLight && (
          <NavLinkImageComponent
            component={logoImageLight}
            imageMode="responsive"
            transparentPlaceholder
            sizes="140px"
            className={cn(
              logoClassName,
              "absolute inset-0 opacity-[var(--nav-logo-light-opacity)] transition-opacity duration-300",
            )}
          />
        )}
      </div>

      {navItems?.length ? (
        <NavigationMenu className="static max-w-none flex-initial">
          <NavigationMenuList>
            {navItems.map((item, index) => (
              <NavigationMenuItem key={item.id ?? index}>
                {item.sections?.length ? (
                  <DropdownNavItem bottomLinks={bottomLinks} item={item} />
                ) : (
                  <DirectNavItem item={item} />
                )}
              </NavigationMenuItem>
            ))}
            <NavigationMenuIndicator />
          </NavigationMenuList>
        </NavigationMenu>
      ) : null}

      <div className="ml-auto flex items-center gap-2">
        <GithubStarButton stars={githubStars} />
        {ctaLinks?.map((link, index) => (
          <NavLink
            key={link.id ?? index}
            href={link.href}
            target={link.target}
            label={link.label}
            decorations={link.decorations}
            className={cn(
              "whitespace-nowrap lg:h-[38px] lg:px-[18px] lg:text-sm xl:h-[42px] xl:px-6 xl:text-base",
              !link.decorations && index === 0 && "border-primary border",
              !link.decorations &&
                index > 0 &&
                "bg-primary text-primary-foreground",
            )}
          />
        ))}
      </div>
    </div>
  );
}

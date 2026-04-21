import type { NavItem, NavLink } from "../../types/navigation";
import { cn } from "../../utils/cn";
import { NavLink as NavLinkComponent } from "../../utils/link";
import {
  NavigationMenuContent,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { NavMenuSection } from "./NavMenuSection";

export interface DropdownNavItemProps {
  readonly bottomLinks: NavLink[] | null | undefined;
  readonly item: NavItem;
  readonly className?: string;
}

export function DropdownNavItem({
  item,
  bottomLinks,
  className,
}: DropdownNavItemProps) {
  if (!item?.link) {
    return null;
  }

  return (
    <>
      <NavigationMenuTrigger className={cn("text-base", className)}>
        {item.link?.label}
      </NavigationMenuTrigger>

      <NavigationMenuContent>
        <div className="divide-strapi-neutral-200 flex max-w-[calc(100vw-2rem)] divide-x">
          {item.sections?.map((section, index) => (
            <NavMenuSection key={section.id ?? index} section={section} />
          ))}
        </div>

        {bottomLinks?.length ? (
          <div className="border-strapi-neutral-200 border-t p-4">
            <div className="flex items-center">
              {bottomLinks.map((link, index) => (
                <NavLinkComponent
                  key={link.id ?? index}
                  href={link.href}
                  target={link.target}
                  label={link.label}
                  decorations={link.decorations}
                  adornmentClassName="size-5"
                  className="text-strapi-neutral-800 hover:text-strapi-blue-600 flex items-center gap-1.5 px-3 py-2 text-sm font-normal"
                />
              ))}
            </div>
          </div>
        ) : null}
      </NavigationMenuContent>
    </>
  );
}

"use client";

import type { NavItem } from "../../types/navigation";
import { cn } from "../../utils/cn";
import { NavLink } from "../../utils/link";
import { navigationMenuTriggerStyle } from "../ui/navigation-menu";

export interface DirectNavItemProps {
  readonly item: NavItem;
  readonly className?: string;
}

export function DirectNavItem({ item, className }: DirectNavItemProps) {
  if (!item) {
    return null;
  }

  const href = item.link?.href;

  if (!href) {
    return (
      <span
        className={cn(
          navigationMenuTriggerStyle(),
          "text-base",
          "cursor-default",
          className,
        )}
      >
        {item.link?.label}
      </span>
    );
  }

  return (
    <NavLink
      href={href}
      target={item.link?.target}
      className={cn(
        navigationMenuTriggerStyle(),
        "text-base",
        "inline-flex items-center justify-center",
        className,
      )}
    >
      {item.link?.label}
    </NavLink>
  );
}

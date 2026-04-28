import { cva, type VariantProps } from "class-variance-authority";
import Link, { type LinkProps } from "next/link";
import { Slot as SlotPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "../../utils/cn";
import { Spinner } from "./spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-base rounded-[8px] font-medium outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 animate-spring-sm no-underline",
  {
    // Don't forget to keep in sync with Link component (LinkDecorations) in Strapi
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border bg-transparent border-primary shadow-xs hover:text-accent-foreground",
        outlineInverse:
          "border bg-transparent border-white text-white hover:bg-white/10",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 drop-shadow",
        purple:
          "bg-strapi-purple-500 text-primary-foreground hover:bg-strapi-purple-500/90",
        ghost: "hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-[28px] gap-1 px-3 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-[38px] gap-1.5 px-[18px] text-sm has-[>svg]:px-3",
        default: "h-[42px] px-6 py-2 has-[>svg]:px-3",
        lg: "h-[50px] px-10 has-[>svg]:px-4 text-lg",
        icon: "size-[42px]",
        "icon-xs": "size-[28px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-[38px]",
        "icon-lg": "size-[50px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
    href?: LinkProps["href"];
  } & Pick<LinkProps, "replace" | "scroll" | "prefetch">;

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  isLoading = false,
  href,
  replace,
  scroll,
  prefetch,
  ...props
}: ButtonProps) {
  const Comp = asChild ? SlotPrimitive.Slot : "button";

  if (isLoading) {
    props.children = <Spinner size="sm" />;
  }

  if (href) {
    return (
      <Link
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        href={href}
        replace={replace}
        scroll={scroll}
        prefetch={prefetch}
        ref={props.ref as React.Ref<HTMLAnchorElement>}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      />
    );
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

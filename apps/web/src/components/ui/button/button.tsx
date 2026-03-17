import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import Link, { type LinkProps } from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary200) focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border border-(--color-primary600) bg-(--color-primary600) text-white hover:bg-(--color-primary700) hover:border-(--color-primary700)",
        secondary:
          "border border-(--color-primary200) bg-transparent text-(--color-primary700) hover:bg-(--color-primary100)",
        ghost:
          "border border-transparent bg-transparent text-(--color-neutral800)",
      },
      size: {
        small: "h-8 px-3 text-xs",
        medium: "h-10 px-4 text-sm",
        large: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "medium",
    },
  },
);

export type ButtonProps = VariantProps<typeof buttonVariants> & {
  asChild?: boolean;
  href?: LinkProps["href"];
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "href"> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  Pick<LinkProps, "replace" | "scroll" | "shallow" | "prefetch" | "locale">;

const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      href,
      replace,
      scroll,
      shallow,
      prefetch,
      locale,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size }), className)}
          ref={ref as React.Ref<HTMLButtonElement>}
          {...props}
        />
      );
    }

    if (href) {
      return (
        <Link
          className={cn(buttonVariants({ variant, size }), className)}
          href={href}
          replace={replace}
          scroll={scroll}
          shallow={shallow}
          prefetch={prefetch}
          locale={locale}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        />
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

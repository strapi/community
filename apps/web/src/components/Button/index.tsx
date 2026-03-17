import Link from "next/link";
import type { ReactNode } from "react";
import { Button as UIButton } from "@/components/ui/button";

type Variant = "primary" | "secondary";
type Size = "small" | "medium" | "large";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

type ButtonAsNative = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type ButtonAsLink = CommonProps & {
  href: string;
};

export type ButtonProps = ButtonAsNative | ButtonAsLink;

export function Button({
  variant = "primary",
  size = "medium",
  children,
  className = "",
  ...props
}: ButtonProps) {
  if ("href" in props && props.href) {
    return (
      <UIButton asChild variant={variant} size={size} className={className}>
        <Link href={props.href}>{children}</Link>
      </UIButton>
    );
  }

  return (
    <UIButton variant={variant} size={size} className={className} {...props}>
      {children}
    </UIButton>
  );
}

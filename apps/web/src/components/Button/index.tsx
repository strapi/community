import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

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
  const classNames = `${styles.button} ${styles[variant]} ${styles[size]} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classNames}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  );
}

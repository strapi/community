import type { VariantProps } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";
import type * as React from "react";
import { buttonVariants } from "../components/ui/button";
import type { FooterLink } from "../types/footer";
import type { LinkDecorations } from "../types/navigation";
import { cn } from "./cn";

interface NavLinkProps extends VariantProps<typeof buttonVariants> {
  href?: string | null;
  target?: string | null;
  label?: string | null;
  className?: string;
  adornmentClassName?: string;
  children?: React.ReactNode;
  openInNewTab?: boolean;
  decorations?: LinkDecorations | null;
}

function isExternalLink(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//")
  );
}

function DecorationIcon({ url, alt }: { url: string; alt?: string | null }) {
  return (
    <Image
      src={url}
      alt={alt ?? ""}
      fill
      className="object-contain"
      sizes="16px"
    />
  );
}

export function NavLink({
  href,
  target,
  label,
  className,
  children,
  adornmentClassName,
  openInNewTab = false,
  decorations,
  variant,
  size,
}: NavLinkProps) {
  // Decorations from CMS data take precedence, then explicit props, then defaults
  const resolvedVariant = (decorations?.variant ??
    variant ??
    "link") as VariantProps<typeof buttonVariants>["variant"];
  const resolvedSize = (decorations?.size ?? size ?? "default") as VariantProps<
    typeof buttonVariants
  >["size"];

  const combinedClassName = cn(
    "group flex flex-row items-center gap-2",
    buttonVariants({ variant: resolvedVariant, size: resolvedSize }),
    className,
  );

  const startAdornment =
    decorations?.hasIcons && decorations.leftIcon?.media?.url ? (
      <span className={cn("relative size-4", adornmentClassName)}>
        <DecorationIcon
          url={decorations.leftIcon.media.url}
          alt={decorations.leftIcon.media.alternativeText}
        />
      </span>
    ) : null;

  const endAdornment =
    decorations?.hasIcons && decorations.rightIcon?.media?.url ? (
      <span className={cn("relative size-4", adornmentClassName)}>
        <DecorationIcon
          url={decorations.rightIcon.media.url}
          alt={decorations.rightIcon.media.alternativeText}
        />
      </span>
    ) : null;

  const content = (
    <>
      {startAdornment}
      {children ?? label}
      {endAdornment}
    </>
  );

  if (!href) {
    return <span className={combinedClassName}>{content}</span>;
  }

  if (isExternalLink(href)) {
    return (
      <a
        href={href}
        target={target ?? (openInNewTab ? "_blank" : undefined)}
        rel="noopener noreferrer"
        className={combinedClassName}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={`${process.env.NEXT_PUBLIC_STRAPI_UI_URL}${href}`}
      target={target ?? (openInNewTab ? "_blank" : undefined)}
      className={combinedClassName}
    >
      {content}
    </Link>
  );
}

interface NavLinkTextProps {
  component?: FooterLink | null;
  children?: React.ReactNode;
  className?: string;
}

export function NavLinkText({
  component,
  children,
  className,
}: NavLinkTextProps) {
  const { href, target, label } = component ?? {};
  const combinedClassName = cn(
    "underline-offset-4 transition-[text-decoration]",
    className,
  );

  if (!href) {
    return <>{children ?? label ?? null}</>;
  }

  if (isExternalLink(href)) {
    return (
      <a
        href={href}
        target={target ?? undefined}
        rel="noopener noreferrer"
        className={combinedClassName}
      >
        {children ?? label}
      </a>
    );
  }

  return (
    <Link
      href={`${process.env.NEXT_PUBLIC_STRAPI_UI_URL}${href}`}
      target={target ?? undefined}
      className={combinedClassName}
    >
      {children ?? label}
    </Link>
  );
}

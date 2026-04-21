import Image from "next/image";
import Link from "next/link";

import type {
  NavImage,
  NavImageField,
  NavLinkImage,
} from "../types/navigation";
import { cn } from "./cn";
import { NavLink } from "./link";

function isExternalUrl(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//")
  );
}

interface NavBasicImageProps {
  image: NavImage;
  mode?: "intrinsic" | "responsive" | "fill";
  className?: string;
  sizes?: string;
  transparentPlaceholder?: boolean;
}

export function NavBasicImage({
  image,
  mode = "intrinsic",
  className,
  sizes,
  transparentPlaceholder,
}: NavBasicImageProps) {
  if (!image.url) return null;

  const commonProps = {
    src: image.url,
    alt: image.alternativeText ?? "",
    ...(transparentPlaceholder && {
      placeholder: "blur" as const,
      blurDataURL:
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    }),
  };

  if (mode === "fill") {
    return (
      <Image
        {...commonProps}
        fill
        className={cn("object-contain", className)}
        sizes={sizes}
      />
    );
  }

  if (mode === "responsive") {
    return (
      <Image
        {...commonProps}
        width={image.width ?? 0}
        height={image.height ?? 0}
        className={className}
        sizes={sizes}
        style={{ width: "auto", height: "auto" }}
      />
    );
  }

  return (
    <Image
      {...commonProps}
      width={image.width ?? 0}
      height={image.height ?? 0}
      className={className}
    />
  );
}

interface NavImageFieldProps {
  field: NavImageField;
  mode?: "intrinsic" | "responsive" | "fill";
  className?: string;
  sizes?: string;
  transparentPlaceholder?: boolean;
}

export function NavImageFieldComponent({
  field,
  ...props
}: NavImageFieldProps) {
  if (!field.media?.url) return null;
  return <NavBasicImage image={field.media} {...props} />;
}

interface NavLinkImageProps {
  component: NavLinkImage;
  imageMode?: "intrinsic" | "responsive" | "fill";
  className?: string;
  sizes?: string;
  transparentPlaceholder?: boolean;
}

export function NavLinkImageComponent({
  component,
  imageMode = "intrinsic",
  className,
  sizes,
  transparentPlaceholder,
}: NavLinkImageProps) {
  if (!component.image?.media?.url) return null;

  const imageEl = (
    <NavBasicImage
      image={component.image.media}
      mode={imageMode}
      sizes={sizes}
      transparentPlaceholder={transparentPlaceholder}
    />
  );

  if (!component.href) {
    return <span className={className}>{imageEl}</span>;
  }

  const ariaLabel = component.label ?? undefined;
  const target = component.newTab ? "_blank" : undefined;

  if (isExternalUrl(component.href)) {
    return (
      <a
        href={component.href}
        target={target}
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={className}
      >
        {imageEl}
      </a>
    );
  }

  return (
    <Link
      href={component.href}
      target={target}
      aria-label={ariaLabel}
      className={className}
    >
      {imageEl}
    </Link>
  );
}

interface NavMenuLinkImageProps {
  component: NavLinkImage;
  imageMode?: "intrinsic" | "responsive" | "fill";
  className?: string;
  sizes?: string;
  transparentPlaceholder?: boolean;
  adornmentClassName?: string;
}

export function NavMenuLinkImageComponent({
  component,
  imageMode = "intrinsic",
  className,
  sizes,
  transparentPlaceholder,
  adornmentClassName,
}: NavMenuLinkImageProps) {
  if (!component.image?.media?.url) return null;

  const imageEl = (
    <NavBasicImage
      image={component.image.media}
      mode={imageMode}
      sizes={sizes}
      transparentPlaceholder={transparentPlaceholder}
    />
  );

  if (!component.href) {
    return <span className={className}>{imageEl}</span>;
  }

  return (
    <NavLink
      href={component.href}
      target={component.newTab ? "_blank" : undefined}
      label={component.label}
      className={cn("group flex flex-row items-center gap-2", className)}
    >
      {imageEl}
    </NavLink>
  );
}

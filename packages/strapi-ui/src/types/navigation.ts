// Raw Strapi media file — fields match the API response directly
export interface NavImage {
  url?: string | null;
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
}

// Strapi media relation wrapper — image fields in the API look like { media: NavImage }
export interface NavImageField {
  id?: string | number | null;
  media?: NavImage | null;
}

export interface LinkDecorations {
  variant?: string | null;
  size?: string | null;
  leftIcon?: NavImageField | null;
  rightIcon?: NavImageField | null;
  hasIcons?: boolean | null;
}

export interface NavLink {
  id?: string | number | null;
  label?: string | null;
  href?: string | null;
  target?: string | null;
  decorations?: LinkDecorations | null;
}

export interface NavLinkImage {
  id?: string | number | null;
  href?: string | null;
  newTab?: boolean | null;
  label?: string | null;
  image?: NavImageField | null;
}

export interface NavMenuLinkItem {
  id?: string | number | null;
  link?: NavLink | null;
  icon?: NavImageField | null;
  description?: string | null;
}

export interface NavSection {
  id?: string | number | null;
  title?: string | null;
  columns?: number | null;
  items?: NavMenuLinkItem[] | null;
}

export interface NavItem {
  id?: string | number | null;
  link?: NavLink | null;
  sections?: NavSection[] | null;
}

export interface NavbarData {
  navItems?: NavItem[] | null;
  ctaLinks?: NavLink[] | null;
  bottomLinks?: NavLink[] | null;
  logoImage?: NavLinkImage | null;
  logoImageLight?: NavLinkImage | null;
  githubStars?: boolean | null;
}

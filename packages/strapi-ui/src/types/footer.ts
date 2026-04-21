import type { NavLinkImage } from "./navigation";

// utilities.link-text — simple text link, no button decorations
export interface FooterLink {
  id?: string | number | null;
  label?: string | null;
  href?: string | null;
  target?: string | null;
}

// elements.footer-item — a section column in the footer
export interface FooterSection {
  id?: string | number | null;
  title?: string | null;
  links?: FooterLink[] | null;
}

// footer.footer-socials — social icon links row
export interface FooterSocials {
  id?: string | number | null;
  title?: string | null;
  socials?: NavLinkImage[] | null;
}

// footer.footer-main — the main footer block
export interface FooterMainData {
  __component: "footer.footer-main";
  id?: string | number | null;
  logoImage?: NavLinkImage | null;
  tagline?: string | null;
  sections?: FooterSection[] | null;
  copyRight?: string | null;
  links?: FooterLink[] | null;
  socials?: FooterSocials | null;
}

export type FooterContent = FooterMainData;

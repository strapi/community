import {
  Github,
  Globe,
  Instagram,
  Linkedin,
  Link as LinkIcon,
  type LucideIcon,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import {
  PROFILE_LINK_TYPE_CONFIG,
  type ProfileLink,
  type ProfileLinkType,
  profileLinkUrl,
} from "@/lib/profile-links";

const ICONS: Record<ProfileLinkType, LucideIcon> = {
  website: Globe,
  github: Github,
  linkedin: Linkedin,
  x: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  linktree: LinkIcon,
};

/** Social links read as the network; websites as their hostname. */
function profileLinkLabel(link: ProfileLink): string {
  if (PROFILE_LINK_TYPE_CONFIG[link.type].handle) {
    return PROFILE_LINK_TYPE_CONFIG[link.type].label;
  }

  try {
    return new URL(link.value).hostname.replace(/^www\./, "");
  } catch {
    return link.value;
  }
}

/**
 * The `links` of a user/organization profile, rendered inline as icon +
 * label for the public profile hero's metadata row.
 */
export function ProfileLinks({ links }: { links: ProfileLink[] }) {
  return links.map((link, index) => {
    const Icon = ICONS[link.type];

    return (
      <Link
        // biome-ignore lint/suspicious/noArrayIndexKey: duplicate links are allowed, so neither type nor value is unique.
        key={index}
        href={profileLinkUrl(link)}
        className="flex items-center gap-1.5 transition-colors hover:text-white"
        target="_blank"
        rel={
          PROFILE_LINK_TYPE_CONFIG[link.type].handle
            ? "noopener noreferrer"
            : "noopener"
        }
      >
        <Icon className="h-4 w-4" />
        {profileLinkLabel(link)}
      </Link>
    );
  });
}

import { Award } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CONTRIBUTOR_TIERS_HELP_URL,
  getContributorTierConfig,
} from "../../lib/contributor-tiers";

type Props = {
  tier: string | null | undefined;
  size?: "sm" | "md";
  /**
   * Links the badge to the "Contributor tiers" help page. Off where the
   * badge already sits inside a link (e.g. a member card).
   */
  linkToHelp?: boolean;
  className?: string;
};

/** A user's contributor tier; renders nothing for users without one. */
export function ContributorTierBadge({
  tier,
  size = "md",
  linkToHelp = false,
  className,
}: Props) {
  const config = getContributorTierConfig(tier);
  if (!config) return null;

  const classes = cn(
    "inline-flex items-center gap-1.5 rounded-full border font-semibold",
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
    config.className,
    linkToHelp && "transition-opacity hover:opacity-80",
    className,
  );

  const content = (
    <>
      <Award
        className={size === "sm" ? "h-3 w-3" : "h-4 w-4"}
        aria-hidden="true"
      />
      {config.label}
    </>
  );

  return linkToHelp ? (
    <Link
      href={CONTRIBUTOR_TIERS_HELP_URL}
      className={classes}
      title="What are contributor tiers?"
    >
      {content}
    </Link>
  ) : (
    <span className={classes}>{content}</span>
  );
}

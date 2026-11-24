import Link from "next/link";
import {
  CONTRIBUTOR_TIERS_HELP_URL,
  getContributorTierConfig,
  getNextContributorTier,
} from "../../lib/contributor-tiers";
import { ContributorTierBadge } from "../contributor-tier-badge";

type Props = {
  tier: string | null | undefined;
  score: number | null | undefined;
};

/**
 * The user's contributor tier, points, and progress towards the next tier
 * — shown at the top of the "GitHub Contributions" tab. Based on the
 * stored (daily-synced) score, so it always agrees with the badge in the
 * profile header and the members directory.
 */
export function ContributorTierProgress({ tier, score }: Props) {
  const points = score ?? 0;
  const current = getContributorTierConfig(tier);
  const next = getNextContributorTier(current?.key);

  const floor = current?.minScore ?? 0;
  const progress = next
    ? Math.min(
        100,
        Math.round(((points - floor) / (next.minScore - floor)) * 100),
      )
    : 100;

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-md border border-(--color-neutral150) bg-white p-5 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex shrink-0 flex-col gap-2">
        {current ? (
          <ContributorTierBadge tier={current.key} linkToHelp />
        ) : (
          <span className="text-sm font-semibold text-(--color-neutral700)">
            No tier yet
          </span>
        )}
        <span className="text-sm text-(--color-neutral600)">
          {points.toLocaleString("en-US")} contribution points
        </span>
      </div>

      <div className="flex grow flex-col gap-2">
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-(--color-neutral150)"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label={
            next ? `Progress towards ${next.label}` : "Highest tier reached"
          }
        >
          <div
            className="h-full rounded-full bg-(--color-primary600)"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-(--color-neutral600)">
          {next
            ? `${(next.minScore - points).toLocaleString("en-US")} points to ${next.label}.`
            : "Highest tier reached — thank you!"}{" "}
          <Link
            href={CONTRIBUTOR_TIERS_HELP_URL}
            className="font-medium text-(--color-primary600) hover:underline"
          >
            How tiers work
          </Link>
        </p>
      </div>
    </div>
  );
}

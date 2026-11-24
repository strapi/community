import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContributionsDashboard } from "../../lib/dashboard";
import { getTierProgress } from "../../lib/progress";
import { ContributorTierBadge } from "../contributor-tier-badge";

/**
 * Every tier, lowest first, with its benefits: the ones already unlocked
 * are checked off, the rest show how many points are still to go.
 */
export function TierLadder({
  dashboard,
}: {
  dashboard: ContributionsDashboard;
}) {
  const { tiers, score, tier: currentTier } = dashboard;
  const { next, percent } = getTierProgress(dashboard);

  return (
    <ol className="flex flex-col gap-3">
      {tiers.map((tier) => {
        const unlocked = score >= tier.minScore;
        const current = tier.key === currentTier;

        return (
          <li
            key={tier.key}
            className={cn(
              "flex flex-col gap-3 rounded-md border p-4",
              current
                ? "border-(--color-primary600) bg-(--color-primary100)/40"
                : tier.key === next?.key
                  ? "border-dashed border-(--color-primary300)"
                  : "border-(--color-neutral150)",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div
                className={cn(
                  "flex items-center gap-3",
                  !unlocked && "opacity-60",
                )}
              >
                <ContributorTierBadge tier={tier.key} />
                <span className="text-sm text-(--color-neutral600)">
                  {tier.minScore.toLocaleString("en-US")}+ points
                </span>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold",
                  unlocked
                    ? "text-(--color-success700)"
                    : "text-(--color-neutral600)",
                )}
              >
                {current
                  ? "Your tier"
                  : unlocked
                    ? "Unlocked"
                    : `${(tier.minScore - score).toLocaleString("en-US")} points to go`}
              </span>
            </div>

            {tier.key === next?.key && (
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-(--color-neutral150)"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(percent)}
                aria-label={`Progress towards ${tier.label}`}
              >
                <div
                  className="h-full rounded-full bg-linear-to-r from-(--color-primary500) to-(--color-primary700)"
                  style={{ width: `${percent}%` }}
                />
              </div>
            )}

            {tier.benefits.length > 0 && (
              <ul className="flex flex-col gap-2">
                {tier.benefits.map((benefit) => (
                  <li key={benefit.title} className="flex items-start gap-2">
                    {unlocked ? (
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-(--color-success600)"
                        aria-label="Unlocked"
                      />
                    ) : (
                      <Lock
                        className="mt-0.5 h-4 w-4 shrink-0 text-(--color-neutral600)"
                        aria-label="Locked"
                      />
                    )}
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          unlocked
                            ? "text-(--color-neutral900)"
                            : "text-(--color-neutral700)",
                        )}
                      >
                        {benefit.title}
                      </span>
                      {benefit.description && (
                        <span className="text-sm text-(--color-neutral600)">
                          {benefit.description}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

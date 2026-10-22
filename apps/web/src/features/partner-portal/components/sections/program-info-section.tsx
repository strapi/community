import { CheckIcon, LayoutGridIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PARTNER_LEVELS, type PartnerLevel } from "../../lib/levels";
import type { PartnerOrganization } from "../../lib/partner-organizations";
import type { PartnerBenefit } from "../../lib/partner-portal";
import { OrganizationMark } from "../organization-mark";
import { cardClassName, Eyebrow, SectionHeader } from "./shared";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 text-sm">
      <dt className="text-(--color-neutral600)">{label}</dt>
      <dd className="min-w-0 break-words text-(--color-neutral900)">{value}</dd>
    </div>
  );
}

export function ProgramInfoSection({
  organization,
  level,
  benefits,
}: {
  organization: PartnerOrganization;
  level: PartnerLevel;
  benefits: PartnerBenefit[];
}) {
  const levelIndex = PARTNER_LEVELS.indexOf(level);
  const website = organization.profile?.website;
  const memberSince = new Date(organization.createdAt).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" },
  );

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <SectionHeader
        title="Partner program information"
        description="Your organization's partner details, level and benefits."
      />

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <div className={cn(cardClassName, "flex flex-col gap-5")}>
          <div className="flex items-center gap-3">
            <OrganizationMark organization={organization} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-(--color-neutral900)">
                {organization.name}
              </p>
              <p className="text-sm text-(--color-neutral600)">
                On Strapi since {memberSince}
              </p>
            </div>
          </div>

          <dl className="flex flex-col gap-3">
            <DetailRow label="Partner level" value={level} />
            {organization.profile?.location && (
              <DetailRow
                label="Location"
                value={organization.profile.location}
              />
            )}
            {website && (
              <DetailRow
                label="Website"
                value={
                  <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-(--color-primary600) hover:underline"
                  >
                    {website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                }
              />
            )}
            <DetailRow label="Partner manager" value="Strapi Partner Team" />
          </dl>
        </div>

        <div className={cn(cardClassName, "flex flex-col gap-5")}>
          <div className="flex flex-col gap-3">
            <Eyebrow>Your partner level</Eyebrow>
            <ol className="grid grid-cols-4 gap-2">
              {PARTNER_LEVELS.map((step, index) => (
                <li key={step} className="flex flex-col gap-2">
                  <span
                    className={cn(
                      "h-1.5 rounded-full",
                      index <= levelIndex
                        ? "bg-(--color-primary600)"
                        : "bg-(--color-neutral150)",
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs",
                      index === levelIndex
                        ? "font-semibold text-(--color-neutral900)"
                        : "text-(--color-neutral600)",
                    )}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-3">
            <Eyebrow>Your benefits</Eyebrow>
            {benefits.length === 0 ? (
              <p className="text-sm text-(--color-neutral600)">
                {level === "Unlisted"
                  ? "Reach Community level to unlock sales and tech enablement."
                  : "No benefits listed for this level yet."}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {benefits.map((benefit) => (
                  <li
                    key={benefit.id}
                    className="flex items-start gap-2 rounded-md border border-(--color-neutral150) px-3 py-2 text-sm"
                  >
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-(--color-primary600)" />
                    <span>
                      <span className="block font-medium text-(--color-neutral900)">
                        {benefit.title}
                      </span>
                      {benefit.description && (
                        <span className="block text-(--color-neutral600)">
                          {benefit.description}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-md border border-dashed border-(--color-neutral150) p-6">
        <div className="flex items-center gap-3">
          <LayoutGridIcon className="size-5 shrink-0 text-(--color-neutral600)" />
          <div>
            <p className="text-sm font-semibold text-(--color-neutral900)">
              Project tracker
            </p>
            <p className="text-sm text-(--color-neutral600)">
              Track active Strapi client projects. Planned for a later phase.
            </p>
          </div>
        </div>
        <Eyebrow>Later</Eyebrow>
      </div>
    </div>
  );
}

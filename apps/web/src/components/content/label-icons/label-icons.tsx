import type { Data } from "@strapi/types";
import { BadgeCheck, Star } from "lucide-react";

const LabelTooltip = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <span className="relative group/label flex items-center shrink-0">
    {children}
    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-neutral-800 px-3 py-1 text-sm font-semibold text-white opacity-0 group-hover/label:opacity-100 transition-opacity z-50">
      {label}
    </span>
  </span>
);

const StrapiLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 600 600"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M0 208C0 109.948 0 60.9218 30.4609 30.4609C60.9218 0 109.948 0 208 0H392C490.052 0 539.078 0 569.539 30.4609C600 60.9218 600 109.948 600 208V392C600 490.052 600 539.078 569.539 569.539C539.078 600 490.052 600 392 600H208C109.948 600 60.9218 600 30.4609 569.539C0 539.078 0 490.052 0 392V208Z"
      fill="#4945FF"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M414 182H212V285H315V388H418V186C418 183.791 416.209 182 414 182Z"
      fill="white"
    />
    <rect x="311" y="285" width="4" height="4" fill="white" />
    <path
      d="M212 285H311C313.209 285 315 286.791 315 289V388H216C213.791 388 212 386.209 212 384V285Z"
      fill="#9593FF"
    />
    <path
      d="M315 388H418L318.414 487.586C317.154 488.846 315 487.953 315 486.172V388Z"
      fill="#9593FF"
    />
    <path
      d="M212 285H113.828C112.046 285 111.154 282.846 112.414 281.586L212 182V285Z"
      fill="#9593FF"
    />
  </svg>
);

type ContentLabelsProps = {
  labels?: Data.Component<"shared.labels"> | null;
  size?: "sm" | "md";
};

const ContentLabels = ({ labels, size = "md" }: ContentLabelsProps) => {
  const iconClass = size === "sm" ? "h-4 w-4" : "h-6 w-6";

  return (
    <>
      {labels?.official && (
        <LabelTooltip label="Made by Strapi">
          <StrapiLogo className={iconClass} />
        </LabelTooltip>
      )}
      {labels?.recommended && (
        <LabelTooltip label="Recommended">
          <BadgeCheck className={`${iconClass} text-green-500`} />
        </LabelTooltip>
      )}
      {labels?.featured && (
        <LabelTooltip label="Featured">
          <Star className={`${iconClass} fill-amber-400 text-amber-400`} />
        </LabelTooltip>
      )}
    </>
  );
};

export { ContentLabels, LabelTooltip, StrapiLogo };

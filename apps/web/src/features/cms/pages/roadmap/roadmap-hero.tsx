import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Hero, HeroSection } from "@/components/layout/hero";
import { cn } from "@/lib/utils";

type Stat = { label: string; value: number };

// Slight, fixed tilts so the cards read as a loose stack (mockup), with no
// randomness to trip hydration.
const TILT = ["-rotate-2", "rotate-1", "rotate-1", "-rotate-1"];

const StatCard = ({ stat, index }: { stat: Stat; index: number }) => (
  <div
    className={cn(
      "rounded-xl border border-white/15 bg-white/[0.07] px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm",
      TILT[index % TILT.length],
    )}
  >
    <p className="text-3xl font-semibold leading-none text-white tabular-nums">
      {stat.value.toLocaleString("en-US")}
    </p>
    <p className="mt-1.5 text-sm text-(--color-cta-muted)">{stat.label}</p>
  </div>
);

const RoadmapHero = ({ stats }: { stats: Stat[] }) => (
  <Hero>
    <HeroSection>
      <div className="flex flex-col lg:flex-row lg:min-h-90">
        <div className="flex flex-1 flex-col justify-center border-b border-(--color-grey700) px-6 py-10 sm:px-10 lg:border-b-0 lg:px-14 lg:py-14">
          <div className="mb-5">
            <Breadcrumbs />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white! sm:text-[48px]">
            Roadmap
          </h1>
          <p className="mt-3 max-w-xl text-[17px] leading-7 text-(--color-hero-muted)">
            Follow what the core team is planning, building and shipping. Where
            there is one, each item links to its GitHub issue and its feedback
            board thread, so you can upvote, comment and follow the work in the
            open.
          </p>
        </div>

        <div
          className="flex w-full items-center justify-center rounded-b-xl px-6 py-10 sm:px-10 lg:w-[42%] lg:rounded-none lg:rounded-r-xl lg:py-14"
          style={{
            background:
              "linear-gradient(135deg, var(--color-cta-from), var(--color-cta-to) 55%, var(--color-primary600))",
          }}
        >
          <div className="grid w-full max-w-sm grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </div>
    </HeroSection>
  </Hero>
);

export { RoadmapHero };

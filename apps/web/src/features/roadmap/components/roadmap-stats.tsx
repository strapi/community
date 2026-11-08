import { cn } from "@/lib/utils";
import { fetchRoadmapItems } from "../lib/data";

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

/** Hero visual for overview pages with a roadmap section. */
const RoadmapStats = async () => {
  const items = await fetchRoadmapItems();

  const count = (statuses: string[]) =>
    items.filter((i) => statuses.includes(i.public_status ?? "")).length;
  const stats = [
    { label: "Planned", value: count(["exploring"]) },
    { label: "In progress", value: count(["in_progress", "beta"]) },
    { label: "Shipped", value: count(["shipped"]) },
    {
      label: "Votes",
      value: items.reduce((sum, i) => sum + (i.canny_votes ?? 0), 0),
    },
  ];

  return (
    <div
      className="ml-auto flex w-full items-center justify-center rounded-lg px-6 py-10 sm:px-10 md:max-w-120 md:shrink"
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
  );
};

export { RoadmapStats };

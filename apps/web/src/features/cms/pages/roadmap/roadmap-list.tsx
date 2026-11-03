import { Container } from "@repo/strapi-ui";
import { Navigation } from "@/components/layout/navigation";
import { fetchRoadmapItems, fetchRoadmapReleases } from "./data";
import { RoadmapBoard } from "./roadmap-board";
import { RoadmapHero } from "./roadmap-hero";
import type { RoadmapState } from "./types";

export const CANNY_BOARD_URL = "https://feedback.strapi.io";

const RoadmapList = async ({
  initialState,
  initialItem,
}: {
  initialState: RoadmapState;
  initialItem?: string;
}) => {
  const [items, releases] = await Promise.all([
    fetchRoadmapItems(),
    fetchRoadmapReleases(),
  ]);

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
    <>
      <Navigation theme="dark" />
      <RoadmapHero stats={stats} />
      <Container>
        <div className="py-10 lg:py-14">
          <RoadmapBoard
            items={items}
            releases={releases}
            initialState={initialState}
            initialItem={initialItem}
          />

          <p className="mt-14 border-t border-(--color-neutral150) pt-6 text-sm text-(--color-neutral700)">
            Don't see what you need?{" "}
            <a
              href={CANNY_BOARD_URL}
              className="font-medium text-(--color-primary600) hover:underline"
            >
              Request it or vote for it on our feedback board
            </a>
            . Votes there are one of the things we look at when deciding what
            goes on this page.
          </p>
        </div>
      </Container>
    </>
  );
};

export { RoadmapList };

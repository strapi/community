import { Container } from "@repo/strapi-ui";
import type { Data } from "@strapi/types";
import {
  fetchRoadmapItems,
  fetchRoadmapReleases,
  RoadmapBoard,
} from "@/features/roadmap";

const CANNY_BOARD_URL = "https://feedback.strapi.io";

type Props = {
  section: Data.Component<"sections.roadmap">;
};

const RoadmapSection = async ({ section }: Props) => {
  const [items, releases] = await Promise.all([
    fetchRoadmapItems(),
    fetchRoadmapReleases(),
  ]);

  return (
    <Container className="py-10 lg:py-14">
      <RoadmapBoard items={items} releases={releases} />

      {section.show_feedback_link && (
        <p className="mt-14 border-t border-(--color-neutral150) pt-6 text-sm text-(--color-neutral700)">
          Don't see what you need?{" "}
          <a
            href={CANNY_BOARD_URL}
            className="font-medium text-(--color-primary600) hover:underline"
          >
            Request it or vote for it on our feedback board
          </a>
          . Votes there are one of the things we look at when deciding what goes
          on this page.
        </p>
      )}
    </Container>
  );
};

export { RoadmapSection };

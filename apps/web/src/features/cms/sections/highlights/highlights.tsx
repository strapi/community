import type { Data } from "@strapi/types";
import { Container } from "@/components/layout/container";

type Props = {
  section: Data.Component<"sections.highlights">;
};

const HighlightsSection = ({ section }: Props) => {
  const { title } = section;
  return (
    <Container>
      <div>{title}</div>
    </Container>
  );
};

export { HighlightsSection };

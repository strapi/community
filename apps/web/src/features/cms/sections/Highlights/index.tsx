import type { Data } from "@strapi/types";
import Container from "@/components/Container";

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

export default HighlightsSection;

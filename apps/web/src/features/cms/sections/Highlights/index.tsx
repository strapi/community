import type { Data } from "@strapi/types";

type Props = {
  section: Data.Component<'sections.highlights'>;
}

const HighlightsSection = ({ section }: Props) => {
  const { title } = section;
  return (
    <div>
      {title}
    </div>
  );
}
 
export default HighlightsSection;
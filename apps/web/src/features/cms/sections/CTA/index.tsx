import type { Data } from "@strapi/types";

type Props = {
  section: Data.Component<"sections.cta">;
};

const CTASection = ({ section }: Props) => {
  const { cta } = section;
  return (
    <div>
      {cta?.title}
      {cta?.content}
    </div>
  );
};

export default CTASection;

import { Grid } from "@strapi/design-system";
import type { Data } from "@strapi/types";

type Props = {
  section: Data.Component<'sections.card-grid'>;
}

const CardGridSection = ({ section }: Props) => {
  return (
    <Grid.Root>
      {section.items?.map((item) => (
        <Grid.Item key={item.id}>
          <div>{item.title}</div>
          <div>{item.content}</div>
        </Grid.Item>
      ))}
    </Grid.Root>
  );
}
 
export default CardGridSection;
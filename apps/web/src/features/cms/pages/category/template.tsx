import { Container } from "@/components/layout/container";
import type { CategoryPageData } from "@/features/cms/pages/category";

type Props = {
  document: CategoryPageData;
};

const CategoryTemplate = ({ document }: Props) => {
  return (
    <Container>
      <h1>{document.name}</h1>
      <p>{document.description}</p>
      {document.children?.map((child) => (
        <div key={child.id}>{child.name}</div>
      ))}
    </Container>
  );
};

export { CategoryTemplate };

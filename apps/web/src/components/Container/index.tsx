import { Box } from "@strapi/design-system";

type Props = {
  children: React.ReactNode;
};

const Container = ({ children }: Props) => {
  return (
    <Box marginLeft={"100px"} marginRight={"100px"}>
      {children}
    </Box>
  );
};

export default Container;

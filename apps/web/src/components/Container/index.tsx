import { Box } from "@strapi/design-system";

type Props = {
  children: React.ReactNode;
} & React.ComponentProps<typeof Box>;

const Container = ({ children, ...props }: Props) => {
  return (
    <Box
      style={{ margin: "0 auto" }}
      paddingLeft={"20px"}
      paddingRight={"20px"}
      {...props}
    >
      {children}
    </Box>
  );
};

export default Container;

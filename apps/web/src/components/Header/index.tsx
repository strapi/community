import { Flex, Grid, LinkButton, Typography } from "@strapi/design-system";
import { Upload } from "@strapi/icons";
import Link from "next/link";
import Container from "@/components/Container";
import { ShapesArray } from "@/components/Shapes";
import styles from "./styles.module.css";

type Props = {
  title: string;
  description: string;
};

const Header = ({ title, description }: Props) => {
  return (
    <header className={styles.gridHeader}>
      <Container>
        <Grid.Item
          col={12}
          direction={"column"}
          alignItems={"flex-start"}
          justifyContent={"center"}
          height={"144px"}
        >
          <Flex
            className={styles.header}
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"flex-end"}
            width={"100%"}
          >
            <Flex direction={"column"} alignItems={"flex-start"}>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: 600,
                }}
              >
                {title}
              </h1>
              <Typography
                textColor={"neutral600"}
                variant="delta"
                fontWeight={400}
              >
                {description}
              </Typography>
            </Flex>
            <Flex>
              <LinkButton
                variant="secondary"
                startIcon={<Upload />}
                tag={Link}
                href="/submit"
              >
                Submit a plugin or provider
              </LinkButton>
            </Flex>
          </Flex>

          <Flex
            className={styles.shapesArray}
            alignItems={"end"}
            direction={"row"}
            gap={"18px"}
            width={"100%"}
          >
            <ShapesArray />
          </Flex>
        </Grid.Item>
      </Container>
    </header>
  );
};

export default Header;

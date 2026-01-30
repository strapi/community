import { Typography } from "@strapi/design-system";
import { type UseStatsProps, useStats } from "react-instantsearch";

const Stats = (props: UseStatsProps) => {
  const { nbHits } = useStats(props);

  return (
    <Typography variant="epsilon" textColor="neutral600">
      {nbHits} result{nbHits !== 1 ? "s" : ""}
    </Typography>
  );
};

export default Stats;

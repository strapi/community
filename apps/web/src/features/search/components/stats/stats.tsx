import { type UseStatsProps, useStats } from "react-instantsearch";

const Stats = (props: UseStatsProps) => {
  const { nbHits } = useStats(props);

  return (
    <p className="text-sm text-(--color-neutral600)">
      {nbHits} result{nbHits !== 1 ? "s" : ""}
    </p>
  );
};

export { Stats };

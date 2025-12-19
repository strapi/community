import { Checkbox } from "@strapi/design-system";
import {
  type UseToggleRefinementProps,
  useToggleRefinement,
} from "react-instantsearch";

type Props = UseToggleRefinementProps & {
  label?: string;
};

const ToggleRefinement = (props: Props) => {
  const { label, ...restProps } = props;

  const { refine, value } = useToggleRefinement(restProps);

  return (
    <Checkbox checked={value.isRefined} onCheckedChange={() => refine(value)}>
      {label ? label : value.name} ({value.count})
    </Checkbox>
  );
};

export default ToggleRefinement;

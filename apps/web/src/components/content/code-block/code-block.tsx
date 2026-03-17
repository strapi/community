import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { base16AteliersulphurpoolLight } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  language: string;
  value: string;
};

const CodeBlock = ({ language, value }: Props) => {
  return (
    <SyntaxHighlighter
      language={language}
      style={base16AteliersulphurpoolLight}
    >
      {value}
    </SyntaxHighlighter>
  );
};

export { CodeBlock };

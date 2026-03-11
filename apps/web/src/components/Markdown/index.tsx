import MarkdownRender from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import CodeBlock from "@/components/CodeBlock";
import styles from "./styles.module.css";

type Props = {
  markdown: string;
};

const Markdown = (props: Props) => {
  return (
    <div className={styles.markdown}>
      <MarkdownRender
        rehypePlugins={[rehypeRaw, remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
          code: (props) => {
            const { children, className, ...rest } = props;
            const match = /language-(\w+)/.exec(className || "");
            return match?.[1] ? (
              <CodeBlock
                value={String(children).replace(/\n$/, "")}
                language={match[1]}
              />
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {props.markdown}
      </MarkdownRender>
    </div>
  );
};

export default Markdown;

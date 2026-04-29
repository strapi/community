"use client";

import { createContext, useContext } from "react";
import MarkdownRender from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/content/code-block";
import styles from "./markdown.module.css";

type Props = {
  markdown: string;
};

const InsidePre = createContext(false);

const Code = ({
  children,
  className,
  node,
  ...rest
}: React.ComponentPropsWithoutRef<"code"> & { node?: unknown }) => {
  const isBlock = useContext(InsidePre);
  const match = /language-(\w+)/.exec(className || "");
  return isBlock || match?.[1] ? (
    <CodeBlock
      value={String(children).replace(/\n$/, "")}
      language={match?.[1] ?? "text"}
    />
  ) : (
    <code {...rest} className={className}>
      {children}
    </code>
  );
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
          pre: ({ children }) => (
            <InsidePre.Provider value={true}>{children}</InsidePre.Provider>
          ),
          code: Code,
        }}
      >
        {props.markdown}
      </MarkdownRender>
    </div>
  );
};

export { Markdown };

"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  language: string;
  value: string;
  copyable?: boolean;
};

const CodeBlock = ({ language, value, copyable = false }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <SyntaxHighlighter language={language} style={nightOwl}>
        {value}
      </SyntaxHighlighter>
      {copyable && (
        <CopyToClipboard text={value} onCopy={handleCopy}>
          <button
            type="button"
            aria-label="Copy to clipboard"
            className="absolute top-3.5 right-3.5 flex items-center justify-center h-7 w-7 rounded bg-transparent hover:bg-white border border-(--color-neutral150) text-(--color-neutral500) hover:text-(--color-neutral800) transition-all cursor-pointer"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 stroke-(--color-neutral100)" />
            )}
          </button>
        </CopyToClipboard>
      )}
    </div>
  );
};

export { CodeBlock };

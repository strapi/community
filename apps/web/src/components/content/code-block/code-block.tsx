"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

const codeBackground =
  nightOwl['pre[class*="language-"]']?.background ?? "#011627";

type Props = {
  language: string;
  value: string;
  copyable?: boolean;
};

const CodeBlock = ({ language, value, copyable = false }: Props) => {
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (!copyable) return;
    const pre = wrapperRef.current?.querySelector("pre");
    if (!pre) return;
    const update = () => {
      setCanScrollRight(pre.scrollLeft + pre.clientWidth < pre.scrollWidth - 4);
    };
    update();
    pre.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(pre);
    return () => {
      pre.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [copyable]);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={wrapperRef} className="relative group">
      <SyntaxHighlighter
        language={language}
        style={nightOwl}
        // Keep the end of the command clear of the copy button.
        customStyle={copyable ? { paddingRight: "3.5rem" } : undefined}
      >
        {value}
      </SyntaxHighlighter>
      {copyable && (
        // Solid strip behind the button, so long commands scroll under it.
        // The fade on its left shows that the command goes on.
        <div className="absolute inset-y-0 right-0 flex">
          <div
            aria-hidden
            className={cn(
              "pointer-events-none w-8 transition-opacity duration-200",
              canScrollRight ? "opacity-100" : "opacity-0",
            )}
            style={{
              background: `linear-gradient(to right, transparent, ${codeBackground})`,
            }}
          />
          <div
            className="pl-2 pr-3.5 pt-3.5"
            style={{ background: codeBackground }}
          >
            <CopyToClipboard text={value} onCopy={handleCopy}>
              <button
                type="button"
                aria-label="Copy to clipboard"
                className="flex items-center justify-center h-7 w-7 rounded bg-transparent border border-(--color-neutral150) text-(--color-neutral500) transition-all cursor-pointer"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 stroke-(--color-neutral100)" />
                ) : (
                  <Copy className="h-3.5 w-3.5 stroke-(--color-neutral100)" />
                )}
              </button>
            </CopyToClipboard>
          </div>
        </div>
      )}
    </div>
  );
};

export { CodeBlock };

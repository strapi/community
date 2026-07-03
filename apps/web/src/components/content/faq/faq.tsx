"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Markdown } from "@/components/content/markdown";
import { cn } from "@/lib/utils";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type Props = {
  title?: string | null;
  items: FaqItem[];
  className?: string;
};

const Faq = ({ title, items, className }: Props) => {
  const [openId, setOpenId] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <div className={className}>
      {title && (
        <h2 className="text-[22px] font-bold text-(--color-neutral900) mb-8">
          {title}
        </h2>
      )}
      <div className="space-y-2.5">
        {items.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className="border border-(--color-neutral150) rounded-lg overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className={cn(
                  "w-full flex items-center justify-between gap-6 px-6 py-[18px] text-left transition-colors duration-200 cursor-pointer",
                  !isOpen && "hover:bg-(--color-neutral100)",
                )}
                aria-expanded={isOpen}
              >
                <span className="text-[15px] font-semibold text-(--color-neutral900)">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "shrink-0 size-[17px] transition-all duration-300 ease-in-out",
                    isOpen
                      ? "rotate-180 text-(--color-primary600)"
                      : "text-(--color-neutral500)",
                  )}
                />
              </button>
              <div
                className="grid motion-safe:transition-[grid-template-rows] motion-safe:duration-300 motion-safe:ease-in-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-8">
                    <div className="border-t border-(--color-neutral150) pt-5">
                      <Markdown markdown={item.answer} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export type { FaqItem };
export { Faq };

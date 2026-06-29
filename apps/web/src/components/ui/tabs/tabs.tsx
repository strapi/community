"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

// ─── Context ────────────────────────────────────────────────────────────────

type TabsContextValue = {
  activeTab: string;
  setActiveTab: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const ctx = useContext(TabsContext);
  if (!ctx)
    throw new Error("Tabs compound components must be used inside <Tabs>");
  return ctx;
};

// ─── Tabs (root) ────────────────────────────────────────────────────────────

type TabsProps = {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
};

const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: TabsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [internalValue, setInternalValue] = useState(
    searchParams.get("tab") ?? defaultValue,
  );
  const activeTabRef = useRef(internalValue);

  const activeTab = value ?? internalValue;

  const setActiveTab = (next: string) => {
    activeTabRef.current = next;
    setInternalValue(next);
    onValueChange?.(next);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Re-assert the tab param if another router update (e.g. InstantSearch) drops it.
  useEffect(() => {
    if (searchParams.get("tab") === activeTabRef.current) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", activeTabRef.current);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn(className)}>{children}</div>
    </TabsContext.Provider>
  );
};

// ─── TabsList ───────────────────────────────────────────────────────────────

type TabsListProps = {
  children: ReactNode;
  className?: string;
};

const TabsList = ({ children, className }: TabsListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-(--background) to-transparent transition-opacity duration-200",
          canScrollLeft ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-(--background) to-transparent transition-opacity duration-200",
          canScrollRight ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
};

// ─── TabsTrigger ────────────────────────────────────────────────────────────

type TabsTriggerProps = {
  value: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

const TabsTrigger = ({
  value,
  icon,
  children,
  className,
}: TabsTriggerProps) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={cn(
        "shrink-0 cursor-pointer font-semibold inline-flex items-center gap-2 rounded-full px-4 py-3 text-[15px] transition-colors",
        isActive
          ? "bg-(--color-primary600) text-white"
          : "bg-(--color-neutral100) text-(--color-neutral700) hover:bg-(--color-neutral150)",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
};

// ─── TabsContent ────────────────────────────────────────────────────────────

type TabsContentProps = {
  value: string;
  children: ReactNode;
  className?: string;
};

const TabsContent = ({ value, children, className }: TabsContentProps) => {
  const { activeTab } = useTabsContext();
  if (activeTab !== value) return null;
  return <div className={cn(className)}>{children}</div>;
};

export { Tabs, TabsContent, TabsList, TabsTrigger };

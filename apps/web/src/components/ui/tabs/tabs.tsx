"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
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

const TabsList = ({ children, className }: TabsListProps) => (
  <div className={cn("flex items-center gap-2", className)}>{children}</div>
);

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
        "cursor-pointer font-semibold inline-flex items-center gap-2 rounded-full px-4 py-3 text-[15px] transition-colors",
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

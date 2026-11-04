"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  type ReactNode,
  Suspense,
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

  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeTabRef = useRef(internalValue);

  const activeTab = value ?? internalValue;

  const selectTab = (next: string) => {
    activeTabRef.current = next;
    setInternalValue(next);
    onValueChange?.(next);
  };

  const setActiveTab = (next: string) => {
    selectTab(next);

    const params = new URLSearchParams(window.location.search);
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {/* Only the URL sync reads search params, so only it suspends; the
          tab content itself stays in the server-rendered HTML. */}
      <Suspense fallback={null}>
        <TabParamSync activeTabRef={activeTabRef} onInitialTab={selectTab} />
      </Suspense>
      <div className={cn(className)}>{children}</div>
    </TabsContext.Provider>
  );
};

type TabParamSyncProps = {
  activeTabRef: { current: string };
  onInitialTab: (value: string) => void;
};

/** Keeps the active tab and the `?tab=` param in sync. */
const TabParamSync = ({ activeTabRef, onInitialTab }: TabParamSyncProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  useEffect(() => {
    const tab = searchParams.get("tab");

    // Open the tab from the URL on first load.
    if (!initialized.current) {
      initialized.current = true;
      if (tab && tab !== activeTabRef.current) {
        onInitialTab(tab);
        return;
      }
    }

    // Re-assert the tab param if another router update (e.g. InstantSearch) drops it.
    if (tab === activeTabRef.current) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", activeTabRef.current);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router, activeTabRef, onInitialTab]);

  return null;
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

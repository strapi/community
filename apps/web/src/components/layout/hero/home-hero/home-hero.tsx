"use client";

import { Button } from "@repo/strapi-ui";
import type { Data } from "@strapi/types";
import { Code2, LayoutTemplate, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AvatarPile } from "@/components/content/avatar-pile";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Hero, HeroSection } from "@/components/layout/hero/hero";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import type { HomePackages, HomeTemplates } from "@/features/cms/pages/home";
import { cn } from "@/lib/utils";

type Tab = "packages" | "templates" | "showcases" | "recipes";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "packages",
    label: "Packages",
    icon: <Code2 className="h-3.5 w-3.5" />,
  },
  {
    id: "templates",
    label: "Templates",
    icon: <LayoutTemplate className="h-3.5 w-3.5" />,
  },
  // {
  //   id: "showcases",
  //   label: "Showcases",
  //   icon: <GalleryHorizontal className="h-3.5 w-3.5" />,
  // },
  // {
  //   id: "recipes",
  //   label: "Recipes",
  //   icon: <BookOpen className="h-3.5 w-3.5" />,
  // },
];

type Props = {
  title: string;
  ctaText: string;
  ctaTitle: string;
  ctaButtons: Data.Component<"shared.button">[];
  packages: HomePackages;
  templates: HomeTemplates;
};

const HomeHero = (props: Props) => {
  const { title, ctaText, ctaTitle, ctaButtons, packages, templates } = props;

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("packages");
  const [searchQuery, setSearchQuery] = useState("");

  const tabScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = tabScrollRef.current;
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
    <Hero>
      <HeroSection>
        <div className="flex flex-col lg:flex-row lg:min-h-90">
          {/* Main: heading & search */}
          <div className="flex flex-1 flex-col justify-center border-b lg:border-b-0 lg:border-r border-(--color-grey700) px-4 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-14">
            <div className="mb-5">
              <Breadcrumbs />
            </div>
            <h1 className="max-w-lg text-4xl sm:text-5xl font-semibold leading-[1.1] tracking-tight text-white!">
              {title}
            </h1>
            <div className="relative mt-8 lg:mt-10 max-w-lg">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    router.push(
                      `/marketplace?query=${encodeURIComponent(searchQuery.trim())}`,
                    );
                  }
                }}
                placeholder="Search Community"
                className="w-full rounded-lg border border-(--color-grey700) px-4 py-3.5 pr-12 text-sm text-white placeholder:text-(--color-hero-nav-muted) focus:outline-none focus:ring-1 focus:ring-(--color-primary500)"
                style={{
                  background:
                    "linear-gradient(to right, rgba(17,22,51,0.9), rgba(45,30,90,0.5))",
                }}
              />
              <Search className="absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-(--color-primary500)" />
            </div>
          </div>

          {/* CTA: Join Community */}
          <div className="flex w-full lg:w-[42%] flex-col items-center justify-center px-4 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-14">
            <h2 className="text-xl font-semibold text-(--color-cta-muted)!">
              {ctaTitle}
            </h2>
            <p className="mt-3 max-w-xs text-center text-sm leading-6 text-(--color-cta-muted)">
              {ctaText}
            </p>
            <div className="mt-7 flex items-center gap-3">
              {ctaButtons.map((button) => (
                <Button
                  key={button.id}
                  href={button.link!}
                  variant={button.type}
                >
                  {button.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </HeroSection>

      {/* Bottom section: Tabs + Cards */}
      <HeroSection>
        {/* Tab bar */}
        <div className="relative border-b border-(--color-grey700)">
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-(--color-hero-bg) to-transparent transition-opacity duration-200",
              canScrollLeft ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            ref={tabScrollRef}
            className="flex items-center justify-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative shrink-0 flex items-center gap-2 px-8 py-4 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "text-white after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-(--color-primary500)"
                    : "text-(--color-hero-muted) hover:text-white",
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-(--color-hero-bg) to-transparent transition-opacity duration-200",
              canScrollRight ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-(--color-grey700)">
          {activeTab === "packages" &&
            packages.map((pkg) => (
              <div key={pkg.id} className="p-4 sm:p-6 lg:p-10 xl:p-14">
                <Link href={pkg.url_alias?.[0]?.url_path!}>
                  <div className="border border-(--color-grey700) rounded-lg mb-5 relative aspect-video object-cover bg-linear-to-br from-white to-violet-100 flex items-center justify-center">
                    <Image
                      src={
                        pkg.icon
                          ? cmsImageUrl(pkg.icon.url)
                          : "/package-fallback-icon.png"
                      }
                      width={80}
                      height={80}
                      alt={pkg.icon?.alternativeText ?? pkg.name ?? ""}
                      className="rounded-lg border border-(--color-neutral150)"
                    />
                  </div>
                  <h3 className="text-base font-bold text-white!">
                    {pkg.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-(--color-hero-muted)">
                    {pkg.description}
                  </p>
                  <div className="mt-4 flex">
                    <AvatarPile white items={[pkg.owner!]} />
                  </div>
                </Link>
              </div>
            ))}
          {activeTab === "templates" &&
            templates.map((template) => (
              <div key={template.id} className="p-4 sm:p-6 lg:p-10 xl:p-14">
                <Link href={template.url_alias?.[0]?.url_path!}>
                  <div className="mb-5 relative aspect-video">
                    <Image
                      src={
                        template.preview_image
                          ? cmsImageUrl(template.preview_image.url)
                          : "/template-fallback-preview.png"
                      }
                      fill
                      alt={
                        template.preview_image?.alternativeText ??
                        template.name ??
                        ""
                      }
                      className="rounded-lg border border-(--color-grey700) object-cover"
                    />
                  </div>
                  <h3 className="text-base font-bold text-white!">
                    {template.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-(--color-hero-muted)">
                    {template.description}
                  </p>
                  <div className="mt-4 flex">
                    <AvatarPile white items={[template.owner!]} />
                  </div>
                </Link>
              </div>
            ))}
        </div>
      </HeroSection>

      {/* View More button */}
      {activeTab === "templates" && (
        <div className="flex justify-center p-4 sm:p-6 lg:p-12">
          <Button
            href="/marketplace?tab=templates"
            variant="primary"
            className="bg-(--color-primary600) px-8 text-sm font-semibold text-white hover:bg-(--color-cta-button-hover)"
          >
            View More Templates
          </Button>
        </div>
      )}
      {activeTab === "packages" && (
        <div className="flex justify-center p-4 sm:p-6 lg:p-12">
          <Button
            href="/marketplace?tab=packages"
            variant="primary"
            className="bg-(--color-primary600) px-8 text-sm font-semibold text-white hover:bg-(--color-cta-button-hover)"
          >
            View More Packages
          </Button>
        </div>
      )}
    </Hero>
  );
};

export { HomeHero };

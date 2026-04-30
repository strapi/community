"use client";

import { Button } from "@repo/strapi-ui";
import type { Data } from "@strapi/types";
import { Code2, LayoutTemplate, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AvatarPile } from "@/components/content/avatar-pile";
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
  subtitle: string;
  ctaText: string;
  ctaTitle: string;
  ctaButtons: Data.Component<"shared.button">[];
  packages: HomePackages;
  templates: HomeTemplates;
};

const HomeHero = (props: Props) => {
  const {
    title,
    subtitle,
    ctaText,
    ctaTitle,
    ctaButtons,
    packages,
    templates,
  } = props;

  const [activeTab, setActiveTab] = useState<Tab>("packages");

  return (
    <Hero>
      <HeroSection>
        <div className="flex min-h-[360px]">
          {/* Left: Main heading & search */}
          <div className="flex flex-1 flex-col justify-center border-r border-(--color-grey700) px-12 py-14">
            <p className="mb-5 text-sm font-semibold text-(--color-primary500)">
              {subtitle}
            </p>
            <h1 className="text-[48px] max-w-lg text-5xl font-semibold leading-[1.1] tracking-tight text-white!">
              {title}
            </h1>
            <div className="relative mt-10 max-w-lg">
              <input
                type="text"
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

          {/* Right: Join Community CTA */}
          <div className="flex w-[42%] flex-col items-center justify-center px-12 py-14">
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
        <div className="flex items-center justify-center border-b border-(--color-grey700)">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-8 py-4 text-sm font-medium transition-colors",
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

        {/* Cards grid */}
        <div className="grid grid-cols-3 divide-x divide-(--color-grey700)">
          {activeTab === "packages" &&
            packages.map((pkg) => (
              <div key={pkg.id} className="p-14">
                <Link href={pkg.url_alias?.[0]?.url_path!}>
                  {/* Preview placeholder */}
                  <div
                    className={`border border-(--color-grey700) rounded-lg mb-5 relative aspect-video object-cover bg-linear-to-br from-white to-violet-100 flex items-center justify-center`}
                  >
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
                  {/* Avatar pile */}
                  <div className="mt-4 flex">
                    <AvatarPile items={pkg.maintainers!} />
                  </div>
                </Link>
              </div>
            ))}
          {activeTab === "templates" &&
            templates.map((template) => (
              <div key={template.id} className="p-14">
                <Link href={template.url_alias?.[0]?.url_path!}>
                  {/* Preview placeholder */}
                  <div className={`mb-5 relative aspect-video object-cover`}>
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
                      className="rounded-lg border border-(--color-grey700)"
                    />
                  </div>
                  <h3 className="text-base font-bold text-white!">
                    {template.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-(--color-hero-muted)">
                    {template.description}
                  </p>
                  {/* Avatar pile */}
                  <div className="mt-4 flex">
                    <AvatarPile items={template.maintainers!} />
                  </div>
                </Link>
              </div>
            ))}
        </div>
      </HeroSection>

      {/* View More button */}
      <div className="p-12 flex justify-center">
        <Button
          href="/templates"
          variant="primary"
          className="bg-(--color-primary600) px-8 text-sm font-semibold text-white hover:bg-(--color-cta-button-hover)"
        >
          View More Templates
        </Button>
      </div>
    </Hero>
  );
};

export { HomeHero };

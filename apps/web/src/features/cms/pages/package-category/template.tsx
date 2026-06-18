import { Button, Container } from "@repo/strapi-ui";
import { Hero, HeroSection } from "@/components/layout/hero";
import { Navigation } from "@/components/layout/navigation";
import { SectionsMapper } from "@/features/cms/sections/mapper";
import { PackagesSearch } from "@/features/search/indexes/packages";
import type { PackageCategoryData } from "./page";

const categoryCardStyle = {
  backgroundImage:
    "var(--bg-dotted-pattern-image), linear-gradient(to right, #0b1025, #1a0d2e)",
  backgroundSize: "var(--bg-dotted-pattern-size, 8px 8px), 100% 100%",
};

const CategoryIcon = () => (
  <span className="shrink-0 rounded-lg bg-(--color-strapi-purple-900) p-2.5 text-(--color-strapi-purple-400)">
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  </span>
);

type Props = {
  document: PackageCategoryData;
};

const PackageCategoryTemplate = ({ document }: Props) => {
  const childCategories = document.children ?? [];

  return (
    <div>
      <Navigation theme="dark" />
      <Hero>
        <HeroSection>
          <div className="px-14 py-26 max-w-250">
            <h1 className="text-[48px] mt-2 sm:mt-0 font-semibold text-white!">
              {document.name}
            </h1>
            <p className="text-[17px] text-(--color-hero-muted)">
              {document.description}
            </p>
            {childCategories.length > 0 && (
              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {childCategories.map((child) => (
                  <Button
                    key={child.documentId}
                    variant="category"
                    size="category"
                    href={child.url_alias?.[0]?.url_path ?? "#"}
                    style={categoryCardStyle}
                  >
                    <CategoryIcon />
                    {child.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </HeroSection>
      </Hero>
      <Container>
        <div className="border-x border-(--color-neutral300) px-8 sm:px-16 py-12">
          <PackagesSearch categoryFilter={document.name!} showFilters={false} />
        </div>
      </Container>
      {document.sections?.map((section) => (
        <SectionsMapper
          key={section.id}
          section={section}
          id={section.__component}
        />
      ))}
    </div>
  );
};

export { PackageCategoryTemplate };

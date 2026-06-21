import { Container } from "@repo/strapi-ui";
import type { Metadata, NextPage } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Hero, HeroSection } from "@/components/layout/hero";
import { Navigation } from "@/components/layout/navigation";
import { HelpPagesSearch } from "@/features/search/indexes/help-pages";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Find answers to your questions about Strapi Marketplace — billing, plugins, templates, and more.",
};

const HelpOverviewPage: NextPage = () => {
  return (
    <div>
      <Navigation theme="dark" />
      <Hero>
        <HeroSection>
          <div className="px-14 py-20 max-w-2xl">
            <div className="mb-3">
              <Breadcrumbs />
            </div>
            <h1 className="text-[48px] mt-2 sm:mt-0 font-semibold text-white! leading-tight">
              Need Help With Something?
            </h1>
            <p className="mt-4 text-[17px] text-(--color-hero-muted)">
              Browse our help topics below to find answers, or search for
              specific questions. We're here to help you get the most out of
              Strapi.
            </p>
          </div>
        </HeroSection>
      </Hero>
      <Container>
        <div className="border-x border-(--color-neutral150) px-8 sm:px-16 py-12">
          <HelpPagesSearch />
        </div>
      </Container>
    </div>
  );
};

export default HelpOverviewPage;

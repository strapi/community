"use client";

import { Container } from "@repo/strapi-ui";
import type { PropsWithChildren } from "react";

const Hero = ({ children }: PropsWithChildren) => {
  return (
    <section className="relative overflow-hidden bg-(--color-hero-bg) bg-dotted">
      {/* Purple radial glow — left side only */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[600px] bg-hero-glow" />

      <Container className="relative z-10">
        {/* Black content card */}
        <div className="border-x border-(--color-grey700) bg-(--color-hero-bg) backdrop-blur-sm">
          {children}
        </div>
      </Container>
    </section>
  );
};

const HeroSection = ({ children }: PropsWithChildren) => {
  return (
    <div className="p-2.5">
      <div className="rounded-xl border border-(--color-grey700)">
        {children}
      </div>
    </div>
  );
};

export { Hero, HeroSection };

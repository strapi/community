"use client";

import type { PropsWithChildren } from "react";
import { Container } from "@/components/layout/container";

const Hero = ({ children }: PropsWithChildren) => {
  return (
    <section
      className="relative overflow-hidden bg-(--color-hero-bg)"
      style={{
        backgroundImage: "var(--bg-dotted-pattern-image)",
        backgroundSize: "var(--bg-dotted-pattern-size)",
      }}
    >
      {/* Purple radial glow — left side only */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[600px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 0% 50%, rgba(109, 40, 217, 0.55), transparent)",
        }}
      />

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
}

export { Hero, HeroSection };

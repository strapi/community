import { Container } from "@/components/layout/container";

type Props = {
  title: string;
  description: string;
};

const Header = ({ title, description }: Props) => {
  return (
    <header
      className="border-b border-(--color-hero-border) bg-(--color-hero-bg) text-white"
      style={{
        backgroundImage: "var(--bg-dotted-pattern-image)",
        backgroundSize: "var(--bg-dotted-pattern-size)",
      }}
    >
      <Container className="border-x border-(--color-hero-border)">
        <div className="w-full py-14 md:py-18">
          <div className="max-w-2xl">
            <p className="mb-5 text-sm text-(--color-primary500)">
              Strapi Marketplace &gt; Submit
            </p>
            <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-(--color-hero-muted)">
              {description}
            </p>
          </div>
        </div>
      </Container>
    </header>
  );
};

export { Header };

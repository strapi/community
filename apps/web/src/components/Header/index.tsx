import Link from "next/link";
import Container from "@/components/Container";

type Props = {
  title: string;
  description: string;
};

const Header = ({ title, description }: Props) => {
  return (
    <header
      className="mb-12 border-b border-(--color-hero-border) bg-(--color-hero-bg) text-white"
      style={{
        backgroundImage:
          "radial-gradient(circle at center, rgba(53,65,123,0.35) 1px, transparent 1px)",
        backgroundSize: "8px 8px",
      }}
    >
      <Container>
        <div className="flex min-h-[200px] w-full items-end justify-between gap-8 py-10">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm text-(--color-primary500)">
              Strapi Marketplace &gt; Submit
            </p>
            <h1 className="text-5xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-4 max-w-2xl text-base text-(--color-hero-muted)">
              {description}
            </p>
          </div>
          <Link
            href="/submit"
            className="hidden min-w-fit items-center gap-2 rounded-md border border-(--color-hero-button-border) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-hero-button-hover) lg:flex"
          >
            {/* <Upload width={14} height={14} /> */}
            Submit a plugin or provider
          </Link>
        </div>
      </Container>
    </header>
  );
};

export default Header;

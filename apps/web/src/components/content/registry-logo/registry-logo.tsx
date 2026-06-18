import Image from "next/image";
import Link from "next/link";

type Props = {
  url: string;
  className?: string;
};

type RegistryInfo = {
  name: string;
  logo: string;
  brand: string;
};

// Brand colors for tinting the SVG background pill
const REGISTRY_MAP: Record<string, RegistryInfo> = {
  "npmjs.com": {
    name: "npm",
    logo: "/registries/npm.svg",
    brand: "#CB3837",
  },
  "pypi.org": {
    name: "PyPI",
    logo: "/registries/pypi.svg",
    brand: "#3775A9",
  },
  "rubygems.org": {
    name: "RubyGems",
    logo: "/registries/rubygems.svg",
    brand: "#E9573F",
  },
  "packagist.org": {
    name: "Packagist",
    logo: "/registries/packagist.svg",
    brand: "#F28D1A",
  },
  "nuget.org": {
    name: "NuGet",
    logo: "/registries/nuget.svg",
    brand: "#004880",
  },
};

function resolveRegistry(rawUrl: string): {
  info: RegistryInfo | null;
  hostname: string;
  href: string;
} {
  let href = rawUrl.trim();
  if (!/^https?:\/\//i.test(href)) {
    href = `https://${href}`;
  }

  let hostname = "";
  try {
    hostname = new URL(href).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    hostname = rawUrl;
  }

  return { info: REGISTRY_MAP[hostname] ?? null, hostname, href };
}

const RegistryLogo = ({ url, className }: Props) => {
  const { info, hostname, href } = resolveRegistry(url);

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={info?.name ?? hostname}
      className={`inline-flex items-center gap-2 group ${className ?? ""}`}
    >
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded overflow-hidden"
        style={{ backgroundColor: info?.brand ?? "#e5e7eb" }}
      >
        {info ? (
          <Image
            src={info.logo}
            alt={info.name}
            width={16}
            height={16}
            className="invert brightness-0 invert"
          />
        ) : (
          <span className="text-[9px] font-bold text-white uppercase leading-none">
            {hostname.split(".")[0]?.slice(0, 3)}
          </span>
        )}
      </div>
      <span className="text-sm font-medium text-(--color-primary700) group-hover:underline">
        {info?.name ?? hostname}
      </span>
    </Link>
  );
};

export { RegistryLogo };

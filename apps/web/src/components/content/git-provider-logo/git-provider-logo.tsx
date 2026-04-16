import Image from "next/image";
import Link from "next/link";

type Props = {
  url: string;
  className?: string;
};

type ProviderInfo = {
  name: string;
  logo: string;
  brand: string;
};

const PROVIDER_MAP: Record<string, ProviderInfo> = {
  "github.com": {
    name: "GitHub",
    logo: "/registries/github.svg",
    brand: "#24292F",
  },
  "gitlab.com": {
    name: "GitLab",
    logo: "/registries/gitlab.svg",
    brand: "#FC6D26",
  },
  "bitbucket.org": {
    name: "Bitbucket",
    logo: "/registries/bitbucket.svg",
    brand: "#0052CC",
  },
  "sourceforge.net": {
    name: "SourceForge",
    logo: "/registries/sourceforge.svg",
    brand: "#FF6600",
  },
};

function resolveProvider(rawUrl: string): {
  info: ProviderInfo | null;
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

  return { info: PROVIDER_MAP[hostname] ?? null, hostname, href };
}

const GitProviderLogo = ({ url, className }: Props) => {
  const { info, hostname, href } = resolveProvider(url);

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
            className="brightness-0 invert"
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

export { GitProviderLogo };

import type * as React from "react";

import { GithubIcon } from "../components/icons";
import { cn } from "./cn";

interface GithubStarButtonProps extends React.ComponentProps<"a"> {
  readonly stars: number | null;
}

function formatStars(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
}

export function GithubStarButton({
  stars,
  className,
  ...restProps
}: GithubStarButtonProps) {
  if (stars == null) {
    return null;
  }

  return (
    <a
      href="https://github.com/strapi/strapi/stargazers"
      target="_blank"
      rel="noreferrer"
      className={cn(
        "animate-spring flex items-center gap-1.5 p-4 text-sm",
        className,
      )}
      {...restProps}
    >
      <GithubIcon className="size-6" />
      <span className="text-base text-inherit">{formatStars(stars)}</span>
    </a>
  );
}

export async function fetchGithubStars(): Promise<number | null> {
  try {
    const res = await fetch("https://api.github.com/repos/strapi/strapi", {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 10800 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count: number };
    return data.stargazers_count;
  } catch {
    return null;
  }
}

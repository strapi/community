import { Button } from "@repo/strapi-ui";
import Image from "next/image";
import Link from "next/link";

type Props = {
  name: string;
  subtitle?: string;
  bio?: string;
  avatarUrl?: string;
  profileUrl: string;
};

const UserCard = ({ name, subtitle, bio, avatarUrl, profileUrl }: Props) => (
  <Link href={profileUrl} className="block h-full no-underline">
    <article className="h-full flex flex-col items-center text-center rounded-md border border-(--color-neutral150) bg-white p-6 shadow-sm">
      {/* Avatar */}
      <div className="rounded-full border-2 border-(--color-primary400) p-1.5">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            width={80}
            height={80}
            alt={name}
            className="rounded-full object-cover w-20 h-20"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-(--color-primary200) flex items-center justify-center text-2xl font-bold text-(--color-primary600)">
            {name?.[0]?.toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 flex-1">
        <p className="font-bold text-(--color-neutral900)">{name}</p>
        {subtitle && (
          <p className="mt-1 text-sm text-(--color-neutral600)">{subtitle}</p>
        )}
        {bio && (
          <p className="mt-1 text-sm text-(--color-neutral600) line-clamp-2">
            {bio}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="my-4 w-full border-t border-(--color-neutral150)" />

      {/* CTA */}
      <Button href={profileUrl} variant="secondary" className="w-full">
        View Profile
      </Button>
    </article>
  </Link>
);

export { UserCard };

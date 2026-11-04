"use client";

import { AuthUIContext } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useContext } from "react";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * The user-only "GitHub contributions" setting in the personal "Profile"
 * tab — toggles the "GitHub Contributions" tab on the public profile
 * (fetched by the CMS's `getGithubContributions`, which needs a linked
 * GitHub account). On by default: `null`/`undefined` count as checked.
 */
export function GithubContributionsToggle({
  checked,
  disabled,
  onCheckedChange,
}: {
  checked: boolean | null | undefined;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const {
    hooks: { useListAccounts },
  } = useContext(AuthUIContext);
  const { data: accounts, isPending } = useListAccounts();

  const githubLinked = accounts?.some(
    (account) => account.providerId === "github",
  );

  return (
    <div className="flex items-start gap-3 rounded-md border border-(--color-neutral150) p-4">
      <Checkbox
        id="show_github_contributions"
        checked={checked !== false}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <div className="flex flex-col gap-1">
        <label
          htmlFor="show_github_contributions"
          className="text-sm font-medium text-(--color-neutral800)"
        >
          Show GitHub contributions
        </label>
        <p className="text-sm text-(--color-neutral600)">
          Show your issues, pull requests and discussions in the strapi/strapi
          GitHub repository on your profile.
        </p>
        {!isPending && !githubLinked && (
          <p className="text-sm text-(--color-neutral600)">
            Connect your GitHub account under{" "}
            <Link
              href="/account/security"
              className="font-medium text-(--color-primary600) hover:underline"
            >
              Security
            </Link>{" "}
            to show them.
          </p>
        )}
      </div>
    </div>
  );
}

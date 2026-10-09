"use client";

import {
  OrganizationCellView,
  useAuthenticate,
} from "@daveyplate/better-auth-ui";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import {
  CheckIcon,
  Loader2Icon,
  MailXIcon,
  UserRoundXIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "../../lib/client";

// `authClient` is exported with the plain `createAuthClient` return type,
// which drops the types its plugins add. Restore the organization
// plugin's methods for the calls this view makes. The plugin types only
// come through when inferred from a real call, so this function exists
// just to be inferred from and is never called.
const withOrganizationPlugin = () =>
  createAuthClient({ plugins: [organizationClient()] });
const { organization } = authClient as unknown as ReturnType<
  typeof withOrganizationPlugin
>;

type Invitation = NonNullable<
  Awaited<ReturnType<typeof organization.getInvitation>>["data"]
>;

type State =
  | { status: "loading" }
  | { status: "ready"; invitation: Invitation }
  | { status: "wrong-recipient" }
  | { status: "invalid" };

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

const CARD_CLASSES =
  "flex w-full max-w-sm flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm";
const BUTTON_CLASSES =
  "inline-flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 font-medium text-sm shadow-xs outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50";
const OUTLINE_BUTTON_CLASSES = `${BUTTON_CLASSES} border bg-background hover:bg-accent hover:text-accent-foreground`;
const PRIMARY_BUTTON_CLASSES = `${BUTTON_CLASSES} bg-primary text-primary-foreground hover:bg-primary/90`;

type AcceptInvitationViewProps = {
  invitationId?: string;
  redirectTo?: string;
};

/**
 * Replaces better-auth-ui's AcceptInvitationCard. That card shows a toast
 * for every failure and then redirects away. When the invitation is for a
 * different email address, it also shows a second, misleading "Invitation
 * not found" toast on top of the real error, and there's no prop to turn
 * that off. Here, failures are explained inside the card, and a visitor
 * signed in with the wrong account can switch to the right one.
 *
 * better-auth-ui doesn't export its internal Card primitives, so the
 * markup below copies AuthView's card classes to match the other `/auth`
 * screens.
 */
export function AcceptInvitationView({
  invitationId,
  redirectTo,
}: AcceptInvitationViewProps) {
  const router = useRouter();
  // Sends a signed-out visitor to sign-in, then back here afterwards.
  const { data: sessionData } = useAuthenticate();
  const [state, setState] = useState<State>({ status: "loading" });
  const [pendingAction, setPendingAction] = useState<
    "accept" | "reject" | "switch" | null
  >(null);

  const userId = sessionData?.user.id;

  useEffect(() => {
    if (!userId) return;
    if (!invitationId) {
      setState({ status: "invalid" });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });
    organization
      .getInvitation({ query: { id: invitationId } })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (data) {
          setState({ status: "ready", invitation: data });
        } else if (
          error?.code === "YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION"
        ) {
          setState({ status: "wrong-recipient" });
        } else {
          // better-auth returns the same error whether the invitation is
          // missing, expired, accepted, rejected, or canceled.
          setState({ status: "invalid" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [invitationId, userId]);

  const accept = async () => {
    if (!invitationId) return;
    setPendingAction("accept");
    const { error } = await organization.acceptInvitation({
      invitationId,
    });
    if (error) {
      toast.error(error.message || "Couldn't accept the invitation.");
      setPendingAction(null);
      return;
    }
    toast.success("Invitation accepted");
    router.replace(redirectTo || "/account");
  };

  const reject = async () => {
    if (!invitationId) return;
    setPendingAction("reject");
    const { error } = await organization.rejectInvitation({
      invitationId,
    });
    if (error) {
      toast.error(error.message || "Couldn't reject the invitation.");
      setPendingAction(null);
      return;
    }
    toast.success("Invitation rejected");
    router.replace("/account");
  };

  const switchAccount = async () => {
    setPendingAction("switch");
    await authClient.signOut();
    const here = window.location.pathname + window.location.search;
    router.replace(
      `/auth/sign-in?${new URLSearchParams({ redirectTo: here })}`,
    );
  };

  if (!sessionData || state.status === "loading") {
    return (
      <div className={`${CARD_CLASSES} items-center`}>
        <Loader2Icon
          className="size-6 animate-spin text-muted-foreground"
          aria-label="Loading invitation"
        />
      </div>
    );
  }

  if (state.status === "wrong-recipient") {
    return (
      <MessageCard
        icon={<UserRoundXIcon className="size-6" aria-hidden="true" />}
        title="This invitation isn't for you"
        description={
          <>
            It was sent to a different email address than the one you're signed
            in with (
            <span className="whitespace-nowrap font-medium text-foreground">
              {sessionData.user.email}
            </span>
            ). Sign in with the invited account to accept it.
          </>
        }
      >
        <button
          type="button"
          onClick={switchAccount}
          disabled={pendingAction !== null}
          className={PRIMARY_BUTTON_CLASSES}
        >
          {pendingAction === "switch" && (
            <Loader2Icon className="size-4 animate-spin" />
          )}
          Switch account
        </button>
      </MessageCard>
    );
  }

  if (state.status === "invalid") {
    return (
      <MessageCard
        icon={<MailXIcon className="size-6" aria-hidden="true" />}
        title="Invitation not available"
        description="This invitation may have expired, been canceled, or already been used. Ask the organization to send you a new one."
      />
    );
  }

  const { invitation } = state;

  return (
    <div className={CARD_CLASSES}>
      <div className="flex flex-col items-center gap-1.5 px-6 text-center">
        <h1 className="font-semibold text-lg leading-none md:text-xl">
          Accept invitation
        </h1>
        <p className="text-muted-foreground text-xs md:text-sm">
          You've been invited to join an organization.
        </p>
      </div>

      <div className="flex flex-col gap-6 px-6">
        <div className="flex flex-row items-center rounded-xl border p-4 shadow-sm">
          <OrganizationCellView
            organization={{
              id: invitation.organizationId,
              name: invitation.organizationName,
              slug: invitation.organizationSlug,
              logo: invitation.organizationLogo,
              createdAt: new Date(),
            }}
          />
          <p className="ml-auto text-muted-foreground text-sm">
            {ROLE_LABELS[invitation.role] ?? invitation.role}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={reject}
            disabled={pendingAction !== null}
            className={OUTLINE_BUTTON_CLASSES}
          >
            {pendingAction === "reject" ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <XIcon className="size-4" />
            )}
            Reject
          </button>
          <button
            type="button"
            onClick={accept}
            disabled={pendingAction !== null}
            className={PRIMARY_BUTTON_CLASSES}
          >
            {pendingAction === "accept" ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <CheckIcon className="size-4" />
            )}
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={CARD_CLASSES}>
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-(--color-primary100) text-(--color-primary600)">
          {icon}
        </div>
        <h1 className="font-semibold text-lg leading-none md:text-xl">
          {title}
        </h1>
        <p className="text-muted-foreground text-xs md:text-sm">
          {description}
        </p>
      </div>

      <div className="grid gap-2 px-6">
        {children}
        <Link href="/account" className={OUTLINE_BUTTON_CLASSES}>
          Go to your account
        </Link>
      </div>
    </div>
  );
}

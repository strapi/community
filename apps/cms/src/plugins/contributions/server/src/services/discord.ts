import type { Core } from "@strapi/strapi";
import { triggerN8nWebhook } from "../../../../../lib/n8n-webhook";
import type { ContributorTier } from "../utils/contributor-tiers";

const ACCOUNT_UID = "plugin::better-auth.account";
const DISCORD_PROVIDER = "discord";

export type DiscordConfig = {
  guildId: string;
  tierRoles: Partial<Record<ContributorTier, string>>;
};

/**
 * What a Discord member's tier roles should be: `roleId` is the role to
 * have (`null`: none), `tierRoleIds` every tier role — the others are
 * removed. Sent to n8n as-is, so the workflows need no config of their own
 * (and staging and production can use different roles).
 */
export type DiscordRoleAssignment = {
  guildId: string;
  discordUserId: string;
  tier: ContributorTier | null;
  roleId: string | null;
  tierRoleIds: string[];
};

/**
 * Contributor tier roles on the Strapi Discord server, for users who
 * connected their Discord account (a better-auth `discord` account). The
 * CMS decides which role a member should have; the n8n
 * `discord-tier-role` workflow assigns it (on every change), and
 * `discord-tier-roles-sync` reconciles everyone nightly (via
 * `GET /api/contributions/discord-roles`) — e.g. for members who joined
 * the server after linking. Disabled until a server (guild) is configured.
 */
export default ({ strapi }: { strapi: Core.Strapi }) => {
  const config = () =>
    strapi.plugin("contributions").config("discord") as DiscordConfig;

  const tierRoleIds = () =>
    Object.values(config().tierRoles ?? {}).filter((roleId): roleId is string =>
      Boolean(roleId),
    );

  const assignment = (
    discordUserId: string,
    tier: ContributorTier | null,
  ): DiscordRoleAssignment => ({
    guildId: config().guildId,
    discordUserId,
    tier,
    roleId: (tier && config().tierRoles?.[tier]) || null,
    tierRoleIds: tierRoleIds(),
  });

  return {
    isEnabled() {
      return Boolean(config()?.guildId) && tierRoleIds().length > 0;
    },

    async findDiscordAccountId(userId: string | number) {
      const account = await strapi.db.query(ACCOUNT_UID).findOne({
        where: { userId: Number(userId), providerId: DISCORD_PROVIDER },
        select: ["accountId"],
      });
      return (account?.accountId as string | undefined) ?? null;
    },

    /**
     * Has n8n bring the user's Discord roles in line with their stored tier
     * — after it changed, or after they connected Discord. Pass
     * `discordUserId` for an account that's being disconnected (its roles
     * are removed: `tier: null`). In the background and never throws:
     * Discord being unreachable mustn't fail a sync or a sign-in, and the
     * nightly reconcile catches up.
     */
    notify(userId: string | number, removed?: { discordUserId: string }): void {
      if (!this.isEnabled()) return;

      setImmediate(async () => {
        try {
          let payload: DiscordRoleAssignment;

          if (removed) {
            payload = assignment(removed.discordUserId, null);
          } else {
            const discordUserId = await this.findDiscordAccountId(userId);
            if (!discordUserId) return;

            const user = await strapi.db
              .query("plugin::better-auth.user")
              .findOne({
                where: { id: Number(userId) },
                select: ["contributor_tier"],
              });
            payload = assignment(
              discordUserId,
              (user?.contributor_tier as ContributorTier | null) ?? null,
            );
          }

          const webhooks = strapi
            .plugin("contributions")
            .config("webhooks") as {
            discordTierRole: string;
          };
          await triggerN8nWebhook(webhooks.discordTierRole, payload, {
            strapi,
            label: "contributions",
          });
        } catch (error) {
          strapi.log.warn(
            `[contributions] Failed to update Discord roles of user ${userId}: ${error}`,
          );
        }
      });
    },

    /**
     * Every connected Discord account with the tier roles it should have —
     * for the nightly reconcile. Empty while disabled.
     */
    async listRoleAssignments(): Promise<DiscordRoleAssignment[]> {
      if (!this.isEnabled()) return [];

      const accounts = await strapi.db.query(ACCOUNT_UID).findMany({
        where: { providerId: DISCORD_PROVIDER },
        select: ["accountId", "userId"],
      });
      if (accounts.length === 0) return [];

      const users = await strapi.db.query("plugin::better-auth.user").findMany({
        where: { id: { $in: accounts.map((account) => account.userId) } },
        select: ["id", "contributor_tier"],
      });
      const tierOf = new Map(
        users.map((user) => [
          String(user.id),
          (user.contributor_tier as ContributorTier | null) ?? null,
        ]),
      );

      return accounts.map((account) =>
        assignment(
          String(account.accountId),
          tierOf.get(String(account.userId)) ?? null,
        ),
      );
    },
  };
};

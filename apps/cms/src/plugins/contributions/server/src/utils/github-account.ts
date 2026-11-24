/**
 * The numeric GitHub user id better-auth stores as the `accountId` of a
 * user's linked GitHub account, or `null` when they haven't linked one.
 */
export async function findGithubAccountId(
  userId: string | number,
): Promise<string | null> {
  const account = await strapi.db.query("plugin::better-auth.account").findOne({
    where: { userId, providerId: "github" },
    select: ["accountId"],
  });

  return account?.accountId ?? null;
}

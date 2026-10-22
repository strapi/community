/**
 * Removes every email/password ("credential") account from every user, so
 * nobody can sign in with a password anymore. Accounts linked to other
 * providers (GitHub, etc.) are left untouched, as are the users themselves —
 * they can still sign in through magic link or a linked social provider.
 *
 * Idempotent: once deleted, there are no credential accounts left to find,
 * so re-running it on the next boot is a no-op.
 */
export const migrateCredentialAccounts = async () => {
  strapi.log.info("Starting credential accounts migration...");
  let deleted = 0;
  let failed = 0;

  const accounts = await strapi
    .documents("plugin::better-auth.account")
    .findMany({
      fields: ["documentId", "userId"],
      filters: { providerId: "credential" },
    });

  for (const account of accounts) {
    try {
      await strapi
        .documents("plugin::better-auth.account")
        .delete({ documentId: account.documentId });
      deleted++;
    } catch (error) {
      failed++;
      strapi.log.error(
        `Error deleting credential account for user ${account.userId}:`,
        error,
      );
    }
  }

  strapi.log.info(
    `Credential accounts migration finished. Deleted: ${deleted}, Failed: ${failed}`,
  );
};

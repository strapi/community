import { sendAccountAccessEmail } from "../lib/email";

const STORE_KEY = "account-access-email-sent";

/**
 * Sends the one-off "you have an account" email (see
 * `src/lib/account-access-email.tsx`) to every existing user, pointing them
 * to the magic-link page so they can sign in to an account that was created
 * for them by a past submission.
 *
 * Migrations run on every boot while ENABLE_MIGRATION=true, so the ids of
 * users that were already emailed are persisted in the core store after each
 * send. Re-running the migration (or resuming after a crash) only emails the
 * users that haven't received it yet.
 */
export const migrateAccountAccessEmail = async () => {
  strapi.log.info("Starting account access email migration...");
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  const store = strapi.store({ type: "core", name: "migration" });
  const sentIds = new Set<string>(
    ((await store.get({ key: STORE_KEY })) as string[] | null) ?? [],
  );
  const url = `${process.env.WEBSITE_URL}/auth/magic-link`;

  const users = await strapi.documents("plugin::better-auth.user").findMany({
    fields: ["documentId", "email"],
    filters: { email: { $notNull: true } },
  });

  for (const user of users) {
    if (sentIds.has(user.documentId)) {
      skipped++;
      continue;
    }

    try {
      await sendAccountAccessEmail(user.email, url);
      sentIds.add(user.documentId);
      await store.set({ key: STORE_KEY, value: [...sentIds] });
      sent++;
    } catch (error) {
      failed++;
      strapi.log.error(
        `Error sending account access email to user ${user.documentId}:`,
        error,
      );
    }
  }

  strapi.log.info(
    `Account access email migration finished. Sent: ${sent}, Skipped (already sent): ${skipped}, Failed: ${failed}`,
  );
};

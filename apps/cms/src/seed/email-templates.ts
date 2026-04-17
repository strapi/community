import type { Core } from "@strapi/strapi";

type SeedTemplate = {
  key: string;
  subject: string;
  body: string;
  description: string;
  from_name?: string;
  reply_to?: string;
};

const seeds: SeedTemplate[] = [
  {
    key: "plugin-submission-received",
    subject: "We've received your submission: {{ package_name }}",
    description:
      "Sent by n8n when a package is submitted to the community marketplace. Variables: package_name, author_name, git_repository.",
    body: `Hi {{ author_name }},

Thanks for submitting **{{ package_name }}** to the Strapi community marketplace.

We've received your submission ({{ git_repository }}) and it's now queued for business and security review. You'll hear from us once both reviews complete — typically within a few business days.

In the meantime, you can keep iterating on the repository; the review looks at the current \`main\`/default branch.

— The Strapi Community team`,
  },
  {
    key: "plugin-approved",
    subject: "Your plugin is live: {{ package_name }}",
    description:
      "Sent by n8n when both business and security review reach 'approved' and the package is published. Variables: package_name, author_name, marketplace_link.",
    body: `Hi {{ author_name }},

Good news — **{{ package_name }}** passed review and is now live on the Strapi community marketplace.

View your listing: {{ marketplace_link }}

Share it, celebrate, and thanks for contributing to the ecosystem.

— The Strapi Community team`,
  },
  {
    key: "plugin-declined",
    subject: "Update on your submission: {{ package_name }}",
    description:
      "Sent by n8n when business review state becomes 'declined'. Variables: package_name, author_name, decline_reason.",
    body: `Hi {{ author_name }},

Thanks again for submitting **{{ package_name }}** to the Strapi community marketplace.

After review we've decided not to list this plugin at this time. Here's the specific feedback from the reviewer:

> {{ decline_reason }}

If you'd like to discuss the decision or address the points raised, reply to this email and we'll be in touch.

— The Strapi Community team`,
  },
  {
    key: "plugin-changes-requested",
    subject: "Changes requested for {{ package_name }}",
    description:
      "Sent by n8n when business review state becomes 'changes_requested'. Variables: package_name, author_name, reviewer_feedback, dashboard_link.",
    body: `Hi {{ author_name }},

Thanks for submitting **{{ package_name }}**. Before we can publish it, the reviewer has asked for a few changes:

> {{ reviewer_feedback }}

Once you've addressed the feedback, update the repository and we'll re-review. You can track status here: {{ dashboard_link }}

— The Strapi Community team`,
  },
];

export async function seedEmailTemplates(strapi: Core.Strapi): Promise<void> {
  for (const seed of seeds) {
    const existing = await strapi
      .documents("api::email-template.email-template")
      .findFirst({ filters: { key: seed.key } });

    if (existing) continue;

    await strapi
      .documents("api::email-template.email-template")
      .create({ data: seed });

    strapi.log.info(`[seed] Created email template: ${seed.key}`);
  }
}

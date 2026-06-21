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
    key: "package-submission-received",
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
    key: "package-approved",
    subject: "Your package is live: {{ package_name }}",
    description:
      "Sent by n8n when both business and security review reach 'approved' and the package is published. Variables: package_name, author_name, marketplace_link.",
    body: `Hi {{ author_name }},

Good news — **{{ package_name }}** passed review and is now live on the Strapi community marketplace.

View your listing: {{ marketplace_link }}

Share it, celebrate, and thanks for contributing to the ecosystem.

— The Strapi Community team`,
  },
  {
    key: "package-declined",
    subject: "Update on your submission: {{ package_name }}",
    description:
      "Sent by n8n when business review state becomes 'declined'. Variables: package_name, author_name, decline_reason.",
    body: `Hi {{ author_name }},

Thanks again for submitting **{{ package_name }}** to the Strapi community marketplace.

After review we've decided not to list this package at this time. Here's the specific feedback from the reviewer:

> {{ decline_reason }}

If you'd like to discuss the decision or address the points raised, reply to this email and we'll be in touch.

— The Strapi Community team`,
  },
  {
    key: "package-changes-requested",
    subject: "Changes requested for {{ package_name }}",
    description:
      "Sent by n8n when business review state becomes 'changes_requested'. Variables: package_name, author_name, reviewer_feedback. Note: the dashboard_link variable is internal (Strapi admin) and must never appear in this developer-facing email body.",
    body: `Hi {{ author_name }},

Thanks for submitting **{{ package_name }}**. Before we can publish it, the reviewer has asked for a few changes:

> {{ reviewer_feedback }}

Once you've addressed the feedback, update the repository and reply to this email — we'll re-review.

— The Strapi Community team`,
  },
  {
    key: "showcase-submission-received",
    subject: "We've received your showcase: {{ package_name }}",
    description:
      "Sent by n8n when a showcase is submitted to the community marketplace. Variables: package_name, author_name, showcase_url.",
    body: `Hi {{ author_name }},

Thanks for submitting **{{ package_name }}** to the Strapi community showcase.

We've received your submission and it's now queued for review. You'll hear from us once a moderator approves it — typically within a few business days.

— The Strapi Community team`,
  },
  {
    key: "showcase-approved",
    subject: "Your showcase is live: {{ package_name }}",
    description:
      "Sent by n8n when a showcase submission is approved. Variables: package_name, author_name.",
    body: `Hi {{ author_name }},

Great news — **{{ package_name }}** has been approved and is now live in the Strapi community showcase gallery.

Thanks for sharing what you've built with Strapi!

— The Strapi Community team`,
  },
  {
    key: "showcase-declined",
    subject: "Update on your showcase submission: {{ package_name }}",
    description:
      "Sent by n8n when a showcase submission is declined. Variables: package_name, author_name, decline_reason.",
    body: `Hi {{ author_name }},

Thanks for submitting **{{ package_name }}** to the Strapi community showcase.

After review we've decided not to list this showcase at this time. Here's the specific feedback from the reviewer:

> {{ decline_reason }}

If you'd like to discuss the decision or address the points raised, reply to this email and we'll be in touch.

— The Strapi Community team`,
  },
  {
    key: "template-submission-received",
    subject: "We've received your template: {{ package_name }}",
    description:
      "Sent by n8n when a template is submitted. Variables: package_name, author_name, git_repository.",
    body: `Hi {{ author_name }},

Thanks for submitting **{{ package_name }}** to the Strapi community templates.

We've received your submission ({{ git_repository }}) and it's now queued for review. You'll hear from us once a moderator has approved or requested changes.

— The Strapi Community team`,
  },
  {
    key: "template-approved",
    subject: "Your template is live: {{ package_name }}",
    description:
      "Sent by n8n when a template submission is approved. Variables: package_name, author_name, marketplace_link (falls back to the repository URL when no marketplace link is available).",
    body: `Hi {{ author_name }},

Good news — **{{ package_name }}** has been approved and is now live on the Strapi community templates.

View it: {{ marketplace_link }}

Thanks for contributing to the ecosystem.

— The Strapi Community team`,
  },
  {
    key: "template-declined",
    subject: "Update on your template submission: {{ package_name }}",
    description:
      "Sent by n8n when a template submission is declined. Variables: package_name, author_name, decline_reason.",
    body: `Hi {{ author_name }},

Thanks again for submitting **{{ package_name }}** to the Strapi community templates.

After review we've decided not to list this template at this time. Here's the specific feedback from the reviewer:

> {{ decline_reason }}

If you'd like to discuss the decision or address the points raised, reply to this email and we'll be in touch.

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

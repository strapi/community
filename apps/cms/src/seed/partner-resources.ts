import type { Core } from "@strapi/strapi";

type PartnerLevel = "Unlisted" | "Community" | "Business" | "Enterprise";

type Seed = {
  title: string;
  slug: string;
  section: "sales_enablement" | "tech_enablement" | "reusable_content";
  minimum_level: PartnerLevel;
  category?: string;
  label?: string;
  /** A lucide icon name, as stored by the `strapi-lucide-icons` field. */
  icon: string;
  link?: string;
  sort_order: number;
  description: string;
  content: string;
};

// Partner portal MVP content. Files (partner badges, partner deck) are
// uploaded in the admin panel.
const seeds: Seed[] = [
  {
    title: "Start here",
    slug: "start-here",
    section: "sales_enablement",
    minimum_level: "Unlisted",
    label: "Guide",
    icon: "compass",
    sort_order: 0,
    description:
      "What's in the portal, who to contact and what to do in your first week as a partner.",
    content: `Welcome to the Strapi partner portal. Yes, we finally have an actual portal, not a public Notion page. Sorry it took so long.

Everything in here is for your team only. Some of it is confidential, so please don't share it outside your organization.

## What's in the portal

- **Program information** shows your partner level and the benefits that come with it.
- **Sales enablement** covers how the program works, deal registration, pricing, positioning and sales recordings.
- **Tech enablement** has learning resources, architecture and migration guides, demo licenses and how to get technical help.
- **Reusable content** holds logos, badges, decks and the co-marketing program.

Deal registration and your existing deals still live outside the portal for now. The [deal registration guide](./deal-registration-guide) explains how they work.

## Your first week

1. Read [how the partner program works](./partner-program-guide) so you know what each level needs and what it unlocks.
2. Find the unique deal registration link we emailed you when you joined. You'll need it for every opportunity you bring to Strapi. If you can't find it, ask us.
3. Sign up for the next live enablement session. Attending one session in any 12-month period is a requirement for Community level and above.
4. Make sure the right people at your company get the monthly partner newsletter. Tell us who to add.
5. Spin up a Strapi project if your team hasn't yet. The [developer learning path](../tech-enablement/developer-learning-path) is a good place to start.

## Contact us

Email [partners@strapi.io](mailto:partners@strapi.io) for anything program-related: deal registration, levels, demo licenses, co-marketing or access to this portal. If you have a dedicated Slack channel with us, you can ask there too.

For technical problems on a client project, see [getting technical help](../tech-enablement/getting-technical-help).`,
  },
  {
    title: "How the partner program works",
    slug: "partner-program-guide",
    section: "sales_enablement",
    minimum_level: "Unlisted",
    label: "Guide",
    icon: "layers",
    sort_order: 1,
    description:
      "The four partner levels, what each one needs, and how partner revenue is counted.",
    content: `The program has four levels: **Registered**, **Community**, **Business** and **Enterprise**. Joining is free. Your level decides your benefits and discounts. It doesn't decide whether you get credit for a deal; that comes from [deal registration](./deal-registration-guide).

## Registered

Every partner starts here. You apply through the [partner form](https://strapi.io/partner-form) and we approve the application. Partners in countries under international sanctions can't join, and Strapi can decline an application at its discretion.

Registered partners get the partner portal, the monthly newsletter, enablement sessions and sales support.

## Community, Business and Enterprise

To reach and keep each level above Registered, you need **at least one** of the two revenue requirements **and all three** ecosystem requirements.

| Requirement | Community | Business | Enterprise |
| --- | --- | --- | --- |
| New partner-registered revenue, closed in the last 12 months | $4,000 | $25,000 | $60,000 |
| *or* Active partner-registered revenue | $6,000 | $30,000 | $75,000 |
| Backlink to strapi.io on your website | Required | Required | Required |
| Marketing contributions in the last 12 months | 1 | 1 | 1 |
| Enablement sessions attended in the last 12 months | 1 | 1 | 1 |

**New partner-registered revenue** is revenue from approved, partner-registered deals that closed in the last 12 months.

**Active partner-registered revenue** is the revenue of all live partner-registered subscriptions where you deliver services or are the primary partner of record.

A **backlink** is a link to strapi.io from your own site: a landing page, blog post or case study all count.

A **marketing contribution** is either a Strapi-focused blog post, case study or landing page (on your site or the Strapi blog), or a plugin you publish and maintain on the [Strapi Marketplace](https://market.strapi.io/).

Because every requirement looks back 12 months, your level reflects recent activity rather than lifetime totals.

## What counts as revenue

Revenue means the recurring subscription value of Strapi licenses from partner-registered deals.

- Annual subscriptions count their annual recurring revenue (ARR) at purchase.
- Monthly subscriptions count the monthly price × 12, but only once the subscription has been active for 90 days. Cancellations before then don't count.
- One-time fees, services, other non-recurring charges and Strapi Cloud usage fees don't count.

### Expansions

Expansions don't count automatically. Credit applies to the original deal you registered. To get credit for an expansion, submit a new deal registration for it. Its revenue then counts towards your active partner-registered revenue. Mid-term expansions are prorated.

### Renewals

A renewal isn't new partner-registered revenue. It can still count towards your active partner-registered revenue if you stay actively involved: driving the renewal, or supporting it by working with our account executive, sharing timeline and account context, and engaging the customer. If you don't respond to renewal outreach, the deal stops counting for you.

## Benefits by level

| Benefit | Registered | Community | Business | Enterprise |
| --- | --- | --- | --- | --- |
| Partner portal, newsletter, enablement sessions, sales support | ✅ | ✅ | ✅ | ✅ |
| Directory listing on [strapi.io/partners](https://strapi.io/partners) and Discord role | | ✅ | ✅ | ✅ |
| [Partner demo licenses](../tech-enablement/partner-sandbox) | | ✅ | ✅ | ✅ |
| [Co-marketing](../reusable-content/co-marketing), partner badge, partner highlights | | ✅ | ✅ | ✅ |
| Short-form video and community calls | | ✅ | ✅ | ✅ |
| Standard support (no SLA) | | | ✅ | ✅ |
| Lead routing | | | ✅ | ✅ |
| Discount on partner-registered deals | | | 5% | 10% |
| Premium support with a dedicated Slack channel | | | | ✅ |
| Strategic marketing initiatives | | | | ✅ |

**Discounts** apply to subscription fees for Strapi CMS Enterprise and Strapi Cloud plans on partner-registered deals. The rate is the one for the level you hold when the purchase is made, whether you or the end customer buys. Discounts don't apply to services, support, Strapi Cloud usage or one-time fees.

**Lead routing** means that when a client asks us for an implementation partner, we look first at Business and Enterprise partners, matched on geography, industry, use case, services and tech stack.

## Moving up a level

Your level is tracked by the Strapi partner team against the requirements above. If you think you now meet the requirements for the next level, email [partners@strapi.io](mailto:partners@strapi.io) with the deals and contributions that get you there.`,
  },
  {
    title: "Deal registration guide",
    slug: "deal-registration-guide",
    section: "sales_enablement",
    minimum_level: "Unlisted",
    label: "Guide",
    icon: "handshake",
    sort_order: 2,
    description:
      "How to register an opportunity, when to do it, and what registration protects.",
    content: `Deal registration is how you tell us you brought an opportunity to Strapi. It's the only way a deal can count as **partner-registered**, which is what moves you up a level and makes your discount apply. It works the same for sales-led Enterprise deals and self-service plans bought on our website.

## How to register a deal

Use the **unique registration link** we emailed you when you joined the program. Registrations made any other way don't count towards your level. If you can't find your link, email [partners@strapi.io](mailto:partners@strapi.io).

The form asks for:

- your company name, plus the name and email of the person submitting
- the end customer's company name, a contact email and their country
- the plan: a self-service plan from our website, or an Enterprise plan

For Enterprise plans it also asks:

- your role in the deal: sourcing and services, services only, procurement, or billing only
- your relationship with the end customer
- whether the end customer needs an RFP or RFQ

End customer details stay confidential. **A registration without a named end customer won't be approved**, and the end customer can't be your own company.

Before you submit, give us a heads-up at partners@strapi.io and include as much detail as you can. It helps us qualify the opportunity quickly. We won't contact your client directly: we'll introduce you to someone on our sales team and work through you.

## When to register

Register as early as you can. The cutoff is:

| Deal type | Register before |
| --- | --- |
| Enterprise (sales-led) | the deal reaches our validation stage, which is when it's handed to the sales team |
| Self-service | the client checks out and the subscription is created |

**There is no retroactive credit.** If a deal wasn't registered in time, it can't be marked partner-registered later, even if you were involved, joined the program afterwards, or the deal has already closed. Tell us as soon as you're working on a Strapi opportunity.

## What happens next

We review registrations within 5 business days and email you to approve or reject them. If you haven't heard back within that time, the registration is treated as rejected, so chase us.

An approved registration makes that specific opportunity yours for **3 months**. During that time we won't approve the same opportunity for another partner. After 3 months the registration expires unless we extend it in writing. If the customer asks to buy directly or through a different partner, we can still sell to them.

If two partners register the same opportunity before either is approved, we decide which registration to approve based on our records of the submissions and how each followed this policy.

## Which deals qualify

To be partner-registered, a deal needs all of these:

1. You materially originated it: you made the introduction or referral, or opened up access or procurement in a way that created new revenue.
2. You registered it before the cutoff and we approved it.
3. It has a named end customer.
4. You're acting as a **solutions partner** (an agency or systems integrator that helps the customer evaluate, buy or implement Strapi) or a **channel reseller** (you originate or enable the demand and transact on the customer's behalf).

These don't qualify:

- billing-only resale, where a reseller handles the paperwork but didn't create the opportunity
- embedded or OEM deals, where you build Strapi into your own product and there's no single named end customer
- licenses your company buys for its own use

## When you helped but didn't register

If a customer came to Strapi directly and then brought you in, or you implemented a project you didn't originate, we record the deal as **partner-influenced**. It shows us the work you're doing, but it doesn't count towards your level or carry a discount.

## Expansions and renewals

An expansion, like more seats or another project for the same customer, needs its own registration to earn credit. Renewals keep counting towards your active revenue while you stay involved. The [program guide](./partner-program-guide) has the details.

## The full policy

This guide follows the Strapi lead registration policy (version 2026-01-01). Questions about the policy can go to [sales@strapi.io](mailto:sales@strapi.io) or [partners@strapi.io](mailto:partners@strapi.io).`,
  },
  {
    title: "Pricing and packaging",
    slug: "pricing-packaging",
    section: "sales_enablement",
    minimum_level: "Unlisted",
    label: "Guide",
    icon: "tag",
    link: "https://quote.strapi.io/",
    sort_order: 3,
    description:
      "Strapi's editions, where to get a price for a proposal, and how partner discounts and reselling work.",
    content: `## The editions

**Community Edition** is free, open source and self-hosted. Most projects start here, and you can build a proof of concept on it without talking to us.

**Strapi Cloud** is managed hosting for Strapi, run by us. Projects can be hosted in three regions: US East, Europe West and Asia Southeast. See the [deployment docs](https://docs.strapi.io/cloud/getting-started/deployment#deploying-a-project).

**Enterprise** adds governance and security features to the CMS, such as SSO, audit logs and review workflows, plus commercial terms and support. Security and compliance documentation is in the [Strapi Trust Center](https://trust.strapi.io/). Enterprise is sold through our sales team.

Self-service plans can be bought directly on our website. See [strapi.io/pricing](https://strapi.io/pricing).

## Pricing a proposal

Use the [Enterprise pricing simulator](https://quote.strapi.io/) to build an estimate for a client. For anything unusual, like many projects, offline licenses or an RFP, email [partners@strapi.io](mailto:partners@strapi.io) and we'll bring in sales.

### What is a "project"?

A project is one Strapi application: one content model and one database. One client can have several. This matters for pricing, so read [what counts as a Strapi project](https://support.strapi.io/articles/2990044364-understanding-the-definition-of-a-strapi-project) before you quote.

## Partner discounts

Business partners get **5%** and Enterprise partners get **10%** off subscription fees for Strapi CMS Enterprise and Strapi Cloud plans, on partner-registered deals. The rate is the one for the level you hold when the purchase is made, whether you or your client buys. Discounts don't apply to services, support, Cloud usage or one-time fees.

A deal only gets the discount if you [registered it](./deal-registration-guide) in time.

## Referring and reselling

You can do either. To refer, register the deal and we contract with your client directly. To resell, you buy Strapi on your own paper and sell it on to your client, which needs the [reseller agreement](https://strapi.io/strapi-reseller-agreement) in place. You accept it when you apply to the program; if you're not sure whether you did, ask us.

One thing to know when reselling: Growth and Enterprise customers can usually see their license key in the [billing portal](https://docs.strapi.io/cms/billing-portal), but resold accounts can't. For a resold subscription, the original license delivery email is where the key lives.

## Managing a client's Strapi Cloud account

You can run a Strapi Cloud account on your client's behalf. For it to count as a partner deal, the subscription still needs a named end customer: a project for your own company isn't partner-registered.`,
  },
  {
    title: "Partner sales playbook",
    slug: "partner-sales-playbook",
    section: "sales_enablement",
    minimum_level: "Unlisted",
    label: "Guide",
    icon: "book-marked",
    sort_order: 4,
    description:
      "When Strapi is a good fit, the questions to ask, and the proof points to use in a pitch.",
    content: `This is a working playbook. It will grow as we add material from our own sales team, so tell us what's missing.

## When Strapi is a good fit

Strapi tends to win when a client:

- wants to own their content and their stack, rather than rent a SaaS CMS
- needs one content backend for several frontends: websites, apps, kiosks, AI agents
- has a content model that doesn't fit a template, or needs custom plugins and integrations
- has a JavaScript or TypeScript team, or wants the agency's team to build in it
- has hosting, data residency or security rules that a SaaS CMS can't meet, so self-hosting matters
- is moving off a legacy or monolithic CMS like WordPress or AEM

It's a harder sell when the client wants a page builder for marketers with no developer involvement at all, or has no one to own the build after launch.

## Discovery questions

Use these to qualify early and to fill in the deal registration form with something useful.

- What's the project, and what does it replace?
- How many frontends, sites, brands or locales will the content feed?
- Where does it need to be hosted? Are there data residency, security review or procurement rules?
- Who edits content day to day, and what approval steps do they need?
- What does it integrate with: commerce, search, DAM, CRM, analytics?
- Who owns it after launch, your team or theirs?
- What's the budget and timeline, and is there an RFP?

Hosting, security and editorial workflow answers usually decide between Community Edition, Strapi Cloud and Enterprise. See [pricing and packaging](./pricing-packaging).

## What to say

**Open-source core.** Strapi's core is open source, so the client isn't locked into a vendor's platform or pricing. They can self-host anywhere or use Strapi Cloud.

**Built for developers, usable by editors.** Developers get a customizable content model, REST and GraphQL APIs, TypeScript support and a plugin system. Editors get an admin panel with features like Live Preview, content history, releases and draft and publish.

**Enterprise when they need it.** SSO, audit logs and review workflows cover governance and security reviews, and the [Strapi Trust Center](https://trust.strapi.io/) has the security and compliance documentation clients ask for. Enterprise customers can also run Strapi AI features on their own AI provider and API key ([bring your own key](https://docs.strapi.io/cms/plugins/byok)).

**One backend, many channels.** Strapi serves websites, mobile apps and AI tooling from the same content. The Strapi MCP server lets clients work with content from their AI tools.

**Their data, their call.** With self-hosting, the client controls what data is stored and where. Strapi Cloud offers US, EU and Asia regions.

## Common objections

**"How does Strapi compare to Contentful or Sanity?"** See [competitive positioning](./competitive-battlecards).

**"Can it handle e-commerce?"** Strapi handles the content and a headless commerce platform like Shopify handles the commerce. Check the [Strapi Marketplace](https://market.strapi.io/) for integrations.

**"Is it GDPR compliant?"** Strapi lets the client control what personal data is stored and where it's hosted. Our security and compliance documentation is in the [Strapi Trust Center](https://trust.strapi.io/), so start there. If an Enterprise deal still needs a security questionnaire or more detail, bring us in.

**"We're on Strapi 4."** We have a migration path and tooling. See the [migration toolkit](../tech-enablement/migration-toolkit).

## Proof points

- [Customer stories](https://strapi.io/user-stories), including PostHog, Yuka and Tesco
- The [official Strapi demo app (LaunchPad)](https://github.com/strapi/LaunchPad) and its [setup video](https://www.youtube.com/watch?v=RSdRM4gw218)
- [Get started with Strapi 5 in 5 minutes](https://www.youtube.com/watch?v=xWrDZ_qxEzQ)
- The [Strapi partner deck](../reusable-content/strapi-partner-deck)

## Recordings

Watch "How we pitch Strapi" and the pricing session in [sales training sessions](./sales-training-sessions).`,
  },
  {
    title: "Competitive positioning",
    slug: "competitive-battlecards",
    section: "sales_enablement",
    minimum_level: "Unlisted",
    label: "Guide",
    icon: "swords",
    link: "https://strapi.io/headless-cms/comparison",
    sort_order: 5,
    description:
      "How to position Strapi against SaaS headless CMSs and traditional CMSs.",
    content: `Start with the public [headless CMS comparison](https://strapi.io/headless-cms/comparison). It's kept up to date and you can share it with clients.

## Against SaaS headless CMSs (Contentful, Sanity and similar)

The difference is ownership. Strapi's core is open source and the client can run it wherever they like, on their own infrastructure or on Strapi Cloud. Their content, database and code stay theirs, and there's no platform lock-in.

Points to make:

- Self-hosting means the client decides where data lives, which helps with data residency and security reviews. The [Strapi Trust Center](https://trust.strapi.io/) has the documentation those reviews ask for.
- The content model, admin panel and APIs can be customized in code, and extended with plugins.
- Your team builds in JavaScript or TypeScript, with a local development workflow.
- Enterprise features like SSO, audit logs and review workflows are there when the client needs them.

## Against WordPress and traditional CMSs

The difference is architecture. Strapi is headless: it serves content over APIs to any frontend, so one backend can feed several sites, apps and channels. Content is structured, not stored as page HTML.

If a client is leaving WordPress, our [Claude Code skill for WordPress migrations](https://strapi.io/blog/how-to-migrate-from-wordpress-to-strapi-using-a-claude-code-skill) maps their site to a Strapi content model and moves entries, media and relations. See the [migration toolkit](../tech-enablement/migration-toolkit).

## Recordings

- [Strapi vs competitors (March 2024)](https://us-79060.app.gong.io/e/c-share/?tkn=s2kdcoxmfokbtmrudncwhij). Some product details have moved on since, but the positioning still holds.
- [How we pitch Strapi (October 2025)](https://drive.google.com/file/d/15vK32etBaVnrEMynJgTynsqo6yE57kdD/view?usp=sharing)

Going up against a specific competitor on a live deal? Email [partners@strapi.io](mailto:partners@strapi.io) and we'll help.`,
  },
  {
    title: "Sales training sessions",
    slug: "sales-training-sessions",
    section: "sales_enablement",
    minimum_level: "Unlisted",
    label: "Video",
    icon: "monitor-play",
    sort_order: 6,
    description: "Recorded sales and program sessions with the Strapi team.",
    content: `Recordings from our partner enablement sessions that focus on selling Strapi and on the partner program. Product and technical sessions are in [enablement sessions and release briefings](../tech-enablement/release-briefings).

Live sessions run roughly every two months on a Wednesday at 10:00 AM ET. Invites go out by email and in the partner newsletter. Attending one session in any 12-month period is a requirement for Community level and above.

## Recordings

| Date | Topic | Recording |
| --- | --- | --- |
| February 2026 | Fimo.ai overview and short-form video co-marketing | [Watch](https://drive.google.com/file/d/1d5HdsmGMH6lLXvCnf7vhQv5Zd--BzgFJ/view?usp=sharing) |
| October 2025 | How we pitch Strapi | [Watch](https://drive.google.com/file/d/15vK32etBaVnrEMynJgTynsqo6yE57kdD/view?usp=sharing) |
| May 2025 | Pricing and RBAC overview | [Watch](https://drive.google.com/file/d/15Ve6b-QzI20tv6TwcQru0jK1NVIsXKIK/view?usp=sharing) |
| September 2024 | Strapi 5 sales enablement | [Watch](https://us-79060.app.gong.io/e/c-share/?tkn=1bxqt1b4vtstj18tq3tgggngxs) |
| March 2024 | Strapi vs competitors | [Watch](https://us-79060.app.gong.io/e/c-share/?tkn=s2kdcoxmfokbtmrudncwhij) |

Pricing and program details in older recordings may be out of date. The [program guide](./partner-program-guide) and [pricing and packaging](./pricing-packaging) pages are current.`,
  },
  {
    title: "Request a joint call",
    slug: "request-a-joint-call",
    section: "sales_enablement",
    minimum_level: "Unlisted",
    label: "Contact",
    icon: "phone-call",
    link: "mailto:partners@strapi.io?subject=Joint%20call%20request",
    sort_order: 7,
    description:
      "Bring Strapi's sales team into a demo or technical call with your client.",
    content: `Every partner level can bring the Strapi sales team into a client conversation. It's most useful for Enterprise evaluations: a product demo, a technical deep dive, a security or procurement review, or a pricing discussion. For a security or compliance review, share the [Strapi Trust Center](https://trust.strapi.io/) with the client first. It answers most questions without a call.

## How to ask

1. [Register the deal](./deal-registration-guide) first if you haven't. It protects the opportunity and makes sure you get credit.
2. Email [partners@strapi.io](mailto:partners@strapi.io) with the client's name, what they're evaluating, what you need from the call and a few times that work.
3. We'll introduce you to someone on our sales team, who'll plan the call with you before anyone talks to the client.

We don't contact your client directly. You stay the lead on the relationship, and we join conversations you set up.

## Implementation

You decide whether Strapi provides any services on your client's project. If you'd rather deliver everything yourselves, say so when you register the deal.`,
  },
  {
    title: "Partner FAQ",
    slug: "partner-faq",
    section: "sales_enablement",
    minimum_level: "Unlisted",
    label: "FAQ",
    icon: "circle-help",
    sort_order: 8,
    description:
      "Quick answers on joining, levels, deals, pricing and support.",
    content: `## Joining the program

**Is there a cost to join?**
No. The program is free.

**Do we need an existing Strapi project to apply?**
No, but you should be able to show you can deliver one.

**What happens after we're accepted?**
You start as a Registered partner. Read [start here](./start-here), join an enablement session, and start building and selling Strapi. The [program guide](./partner-program-guide) explains how to reach the next level.

**How long does onboarding take?**
About an hour to read through the portal and get familiar with the resources.

## Levels and benefits

**How do partner levels work?**
Levels set your requirements and benefits. Credit for a deal is decided per deal, through [deal registration](./deal-registration-guide). Both are explained in the [program guide](./partner-program-guide).

**How do partner discounts work?**
Business partners get 5% and Enterprise partners 10% on Strapi CMS Enterprise and Strapi Cloud subscriptions for partner-registered deals. See [pricing and packaging](./pricing-packaging).

**When do we move up a level?**
When you meet the requirements for the next one. A level change doesn't make earlier deals partner-registered after the fact.

**Can we get demo licenses?**
Community, Business and Enterprise partners can. See [partner demo licenses](../tech-enablement/partner-sandbox).

## Deals and leads

**How does deal registration work?**
Register every opportunity with your unique registration link before the cutoff. The [deal registration guide](./deal-registration-guide) covers it step by step.

**Does Strapi compete with partners for deals?**
No. Credit is decided by clear rules on each deal: registration, timing and the role you played. It isn't decided by claims after the fact.

**What if a client comes to Strapi directly?**
We may record you as partner-influenced if you play a real part in closing the deal. Partner-registered credit always needs a registration made in time.

**How are inbound leads shared with partners?**
Business and Enterprise partners get priority. We match on geography, industry, use case, services and tech stack.

**Can we resell Strapi Cloud, or only refer it?**
Both. Reselling needs the [reseller agreement](https://strapi.io/strapi-reseller-agreement), which you accept when you apply.

**Can we manage a Strapi Cloud account for a client?**
Yes. For partner credit the subscription needs a named end customer. Projects for your own company don't count.

## Product and pricing

**What's the difference between Community Edition, Cloud and Enterprise?**
Community Edition is free and self-hosted. Strapi Cloud is managed hosting. Enterprise adds governance and security features and commercial terms. More in [pricing and packaging](./pricing-packaging), and security and compliance documentation is in the [Strapi Trust Center](https://trust.strapi.io/).

**What counts as a Strapi "project"? Can a client have several sites?**
A project is one Strapi application with one content model and one database. A client can have several. See [what counts as a Strapi project](https://support.strapi.io/articles/2990044364-understanding-the-definition-of-a-strapi-project).

**Which regions does Strapi Cloud run in?**
US East, Europe West and Asia Southeast. See the [deployment docs](https://docs.strapi.io/cloud/getting-started/deployment#deploying-a-project).

**Does Strapi support GDPR compliance?**
Your client controls what data is stored in Strapi and, if self-hosting, where it lives. For security and compliance documentation, point them to the [Strapi Trust Center](https://trust.strapi.io/).

**Can Strapi work with Shopify or other commerce platforms?**
Yes. A common setup is Strapi for content and a headless commerce platform for commerce. Browse the [Strapi Marketplace](https://market.strapi.io/) for integrations.

**What does Strapi Enterprise cost?**
Use the [pricing simulator](https://quote.strapi.io/).

## Support and training

**Is there a Strapi developer certification?**
Not at the moment. The [developer learning path](../tech-enablement/developer-learning-path) is the best place to train your team.

**What technical support do partners get?**
It depends on your client's plan and your partner level. See [getting technical help](../tech-enablement/getting-technical-help).

**What if a client project hits a Strapi bug?**
Follow [getting technical help](../tech-enablement/getting-technical-help). If the client has a paid plan, they can open a support ticket.

**Does Strapi offer implementation services to Enterprise clients, and does that compete with us?**
You decide whether Strapi provides services on your client's project.

**What co-marketing can we do with Strapi?**
Community partners and above can use the [co-marketing program](../reusable-content/co-marketing).`,
  },
  {
    title: "Developer learning path",
    slug: "developer-learning-path",
    section: "tech_enablement",
    minimum_level: "Unlisted",
    label: "Course",
    icon: "graduation-cap",
    link: "https://docs.strapi.io/",
    sort_order: 0,
    description:
      "Where to send a developer who's new to Strapi, from first project to production.",
    content: `There's no formal Strapi certification yet. This is the route we'd give a developer joining your team.

## 1. First project

- [Get started with Strapi 5 in 5 minutes](https://www.youtube.com/watch?v=xWrDZ_qxEzQ)
- The [Strapi documentation](https://docs.strapi.io/), starting with the quick start
- Clone the [LaunchPad demo app](https://github.com/strapi/LaunchPad) and follow its [setup video](https://www.youtube.com/watch?v=RSdRM4gw218). It's a full Strapi and Next.js project you can take apart.

## 2. Content modeling and the admin

- The Content-Type Builder: collection and single types, components, dynamic zones, relations, and folders for large models ([docs](https://docs.strapi.io/cms/features/content-type-builder#organizing-content-types-with-folders))
- [Media Library](https://docs.strapi.io/cms/features/media-library)
- Draft and publish, Live Preview, content history and releases

## 3. Building it properly

- The [Strapi development best practices playlist](https://www.youtube.com/watch?v=ibHd96Oz3eg&list=PL7Q0DQYATmvg5Ip7hpXypLf_G3-zEWhR6)
- [Custom RBAC conditions](https://docs.strapi.io/cms/configurations/guides/rbac)
- Plugins: browse the [Strapi Marketplace](https://market.strapi.io/) before building your own. Publishing and maintaining a plugin there counts as a marketing contribution for your partner level.
- [Architecture guides](./architecture-guides) for deployment and multi-site setups

## 4. Enterprise features

If your clients buy Enterprise, your team should know:

- SSO, review workflows and audit logs ([audit log export](https://docs.strapi.io/cms/features/audit-logs#exporting-audit-logs))
- [Bring your own AI key](https://docs.strapi.io/cms/plugins/byok) for Strapi AI features
- Installing Enterprise plugins with \`strapi enterprise install\`

Community, Business and Enterprise partners can try all of this on a [partner demo license](./partner-sandbox).

## 5. Keep up

- Join the live [enablement sessions](./release-briefings) and watch the recordings
- Read the monthly partner newsletter
- Join the [Strapi Discord](https://discord.com/invite/strapi) and follow [Strapi on GitHub](https://github.com/strapi/strapi)`,
  },
  {
    title: "Architecture guides",
    slug: "architecture-guides",
    section: "tech_enablement",
    minimum_level: "Unlisted",
    label: "Docs",
    icon: "network",
    sort_order: 1,
    description:
      "Hosting, multi-site and scaling references for enterprise Strapi projects.",
    content: `These are the references we point partners to when scoping larger builds. If you're designing something unusual, [get in touch](./getting-technical-help) before the client signs off on the architecture.

## Hosting

- **Strapi Cloud**: managed hosting in US East, Europe West or Asia Southeast. See [deploying a project](https://docs.strapi.io/cloud/getting-started/deployment#deploying-a-project).
- **Self-hosted**: Strapi runs anywhere Node.js does, with your own database and storage. Start from the [deployment docs](https://docs.strapi.io/cms/deployment).

## Projects, environments and licensing

Licensing is per project, so the architecture affects the price. A project is one Strapi application with one content model and one database. Read [what counts as a Strapi project](https://support.strapi.io/articles/2990044364-understanding-the-definition-of-a-strapi-project) before you decide how many Strapi apps a client needs.

## Multi-site, multi-brand and multi-domain

One Strapi project can serve many sites and brands. Two enablement sessions cover the patterns:

- [Multi-domain mastery with VirtusLab (January 2026)](https://drive.google.com/file/d/1YtxCwZmPABanaXsqLhtVixOi_Ndezf9r/view?usp=sharing)
- [Multi-tenancy, side editor and relations on the fly (April 2025)](https://us-79060.app.gong.io/e/c-share/?tkn=i0i4vpp4raze1b3mw60sj5p9q)

## Performance

Across the Strapi 5 releases of summer 2026, API throughput went up about 2.4x and response times got about 2.5x faster, with no migration or config change needed. Keeping clients on a current version is the simplest performance work you can do. The [August 2026 enablement session](https://drive.google.com/file/d/1qp8v-g7pNnWAesbS_mvw_PpT4tLBk6pb/view?usp=sharing) covers the changes.

## Security

- Session security: short-lived access tokens, one-time refresh tokens and logout on password change (August 2026 session, above)
- [Custom RBAC conditions](https://docs.strapi.io/cms/configurations/guides/rbac)
- [Audit logs](https://docs.strapi.io/cms/features/audit-logs#exporting-audit-logs) (Enterprise)
- [Strapi Trust Center](https://trust.strapi.io/): security and compliance documentation for client reviews
- [Strapi security policy](https://github.com/strapi/strapi/security/policy)`,
  },
  {
    title: "Partner demo licenses",
    slug: "partner-sandbox",
    section: "tech_enablement",
    minimum_level: "Unlisted",
    label: "Access",
    icon: "flask-conical",
    link: "mailto:partners@strapi.io?subject=Partner%20demo%20license%20request",
    sort_order: 2,
    description:
      "Free Enterprise and Strapi Cloud licenses for internal builds and client demos.",
    content: `Community, Business and Enterprise partners can get demo licenses to learn Strapi's paid features and show them to prospects.

## What you get

**One CMS Enterprise license.** All Enterprise features, five seats, for 12 months.

**One Strapi Cloud Pro plan.** The base subscription is free for 12 months. It covers one project and the base usage limits. Any usage over those limits is charged to you, so you'll need a card on file.

## What you can use them for

Demo licenses are for your team to test and build internally, and to demo Strapi Enterprise features to prospects. You can't use them for client projects, commercial work or your own business systems.

## How to get them

1. Email [partners@strapi.io](mailto:partners@strapi.io) with your company name and the contact who should receive the licenses.
2. We check your partner level and set them up.
3. You get your Enterprise license by email, and a one-time coupon code for Strapi Cloud.
4. Sign up for an annual Strapi Cloud Pro plan and apply the coupon at checkout.

Licenses last 12 months. Ask us to renew before they expire. Renewal depends on your partner level at the time.

## Not at Community level yet?

You can build a full proof of concept on the free, self-hosted [Community Edition](https://docs.strapi.io/). The [program guide](../sales-enablement/partner-program-guide) explains how to reach Community level.`,
  },
  {
    title: "Getting technical help",
    slug: "getting-technical-help",
    section: "tech_enablement",
    minimum_level: "Unlisted",
    label: "Support",
    icon: "life-buoy",
    link: "https://support.strapi.io/",
    sort_order: 3,
    description:
      "Where to go when a client project needs help, depending on the plan and your partner level.",
    content: `## Community help (any edition)

- The [Strapi Discord](https://discord.com/invite/strapi) is the place for community help. Community, Business and Enterprise partners can get a partner role there; ask us to set it up.
- Report bugs on [GitHub](https://github.com/strapi/strapi/issues).
- Report security issues through the [security policy](https://github.com/strapi/strapi/security/policy), not in public.

## Paid support (client projects)

If your client has a Strapi Cloud or Enterprise plan, their project is covered by Strapi support. What's covered depends on the plan: see [Strapi support coverage](https://support.strapi.io/articles/6650214304-understanding-strapi-support-coverage).

- **Self-hosted Enterprise:** open a ticket on the [Strapi support portal](https://support.strapi.io/). If you need access to file tickets for a client's project, email [support@strapi.io](mailto:support@strapi.io).
- **Strapi Cloud:** use the Help button in the [Cloud dashboard](https://cloud.strapi.io/projects).

## Partner support

On top of your clients' plans:

| Level | Support |
| --- | --- |
| Business | Standard support for any version of Strapi you're working on, with no SLA |
| Enterprise | Premium support for all your projects, with a dedicated Slack channel |

Registered and Community partners use community help, plus paid support on clients' paid plans.

## Writing a good ticket

Include the Strapi version, Node.js version, database, hosting (Cloud or self-hosted, and where), the steps to reproduce, and the full error or log. A minimal reproduction gets you an answer much faster.`,
  },
  {
    title: "Migration toolkit",
    slug: "migration-toolkit",
    section: "tech_enablement",
    minimum_level: "Unlisted",
    label: "Toolkit",
    icon: "repeat",
    sort_order: 4,
    description:
      "Guides and tools for moving clients from Strapi 4, WordPress and other CMSs to Strapi 5.",
    content: `## Strapi 4 to Strapi 5

Start with the official docs, then the recordings.

- [Upgrading to Strapi 5: introduction and FAQ](https://docs.strapi.io/cms/migration/v4-to-v5/introduction-and-faq)
- [Breaking changes](https://docs.strapi.io/cms/migration/v4-to-v5/breaking-changes), including the new REST API response format
- [Plugin upgrade summary](https://docs.strapi.io/cms/migration/v4-to-v5/additional-resources/plugins-migration)
- [How to migrate your Strapi 4 project to Strapi 5](https://strapi.io/blog/how-to-migrate-your-project-from-strapi-4-to-strapi-5) (blog walkthrough)

Recordings:

- [Migrating to Strapi 5, special session](https://us-79060.app.gong.io/e/c-share/?tkn=vvjo68j1tvogm5eydzxnhne6) and its [slides](https://docs.google.com/presentation/d/1O6axVI8x43ce0XG6Nx7Ty3LW_qWEQ_MNqmTMbv2UtIw/edit?usp=sharing)
- [Hycom's DXP frontend starter and v4 to v5 migration best practices (September 2025)](https://drive.google.com/file/d/1hEPPpkCaf4qnt57VoMYxUqLUNcx09W5f/view?usp=sharing)
- [Strapi 5 migration technical enablement](https://us-79060.app.gong.io/e/c-share/?tkn=rx4tzv3emci31ltxiuhfzg8ke)

Recent releases made v4 to v5 migrations much faster on large, localized projects, so it's worth upgrading to the latest Strapi 5 version before you migrate the data.

For clients still on Strapi 4, the [security policy](https://github.com/strapi/strapi/security/policy) lists which versions get security fixes.

## WordPress to Strapi

Our developer advocate built a Claude Code skill for WordPress migrations. It reads a WordPress site, proposes a Strapi content model for you to review, then moves entries, media and relations across. It handles the usual problems: custom post types, ACF fields that the WordPress API doesn't expose, and Elementor pages, which can come across as reorderable Strapi components instead of one block of HTML.

It's a starting point rather than a one-click migration, but it takes most of the grunt work out of scoping and running a move. There's a demo WordPress site to practice on.

- [Read the guide](https://strapi.io/blog/how-to-migrate-from-wordpress-to-strapi-using-a-claude-code-skill)
- [Watch the walkthrough](https://www.youtube.com/watch?v=z2iOcjB4ZhQ)

## Other CMSs

There's no ready-made tool for every platform. Strapi's REST API and Document Service make scripted imports straightforward. Planning a migration from AEM, Contentful or something else for an Enterprise client? Tell us early and we'll help scope it.`,
  },
  {
    title: "Enablement sessions and release briefings",
    slug: "release-briefings",
    section: "tech_enablement",
    minimum_level: "Unlisted",
    label: "Webinar",
    icon: "rocket",
    sort_order: 5,
    description:
      "Live sessions with Strapi product and engineering, and recordings of past sessions.",
    content: `Partner enablement sessions are 45-minute live webinars with Strapi's product, engineering and developer relations teams. Most cover what's just shipped or about to, with demos and Q&A. They run roughly every two months on a Wednesday at 10:00 AM ET, and every session is recorded.

Attending one live session in any 12-month period is a requirement for Community level and above. Invites go out by email and in the partner newsletter.

Sales-focused sessions are in [sales training sessions](../sales-enablement/sales-training-sessions).

## Recordings

| Date | Topics | Recording |
| --- | --- | --- |
| October 2026 | Content-Type Builder and folders, Strapi AI for Enterprise with bring your own key | [Watch](https://drive.google.com/file/d/1sFwodIWTE1oaFwxgcP23cGzfizGDcTPh/view?usp=drive_link) |
| August 2026 | Session security, publishing workflow updates, CMS performance | [Watch](https://drive.google.com/file/d/1qp8v-g7pNnWAesbS_mvw_PpT4tLBk6pb/view?usp=sharing) |
| January 2026 | Multi-domain mastery with VirtusLab, Media Library roadmap | [Watch](https://drive.google.com/file/d/1YtxCwZmPABanaXsqLhtVixOi_Ndezf9r/view?usp=sharing) |
| December 2025 | The great bug fix | [Slides](https://docs.google.com/presentation/d/1XK4n3sBNA4LXM0FF--e7wpsaHE0Xg2RUyVQR6nUvvEU/edit?usp=sharing) |
| November 2025 | Exploring Strapi AI, with the product and engineering teams | [Watch](https://drive.google.com/file/d/1fy9ueWeRGQpk3VE0LXHGLhOjQEdh2ZeA/view?usp=sharing) |
| September 2025 | Hycom's DXP frontend starter, v4 to v5 migration best practices | [Watch](https://drive.google.com/file/d/1hEPPpkCaf4qnt57VoMYxUqLUNcx09W5f/view?usp=sharing) |
| July 2025 | Mux plugin, Content-Type Builder updates, conditional fields | [Watch](https://us-79060.app.gong.io/e/c-share/?tkn=1r42nqhfbguof1csmhhquyvo0n) |
| June 2025 | Strapi AI and Live Preview | [Watch](https://drive.google.com/file/d/19P5HVISq9NT6PkLOyphIZiYhPpjALK7K/view?usp=sharing) |
| April 2025 | Side editor, relations on the fly, multi-tenancy | [Watch](https://us-79060.app.gong.io/e/c-share/?tkn=i0i4vpp4raze1b3mw60sj5p9q) |
| March 2025 | Review workflows and releases, co-marketing process | [Watch](https://drive.google.com/file/d/1RH-Z7jvhLOMtwUjzc1zOY6lZBdHFnHxV/view?usp=sharing) |

Migration sessions are collected in the [migration toolkit](./migration-toolkit).

## Staying current between sessions

- The monthly partner newsletter covers what's shipped and what it means for your clients.
- [Strapi releases on GitHub](https://github.com/strapi/strapi/releases) list every change.
- Vote on and follow features on the [feedback board](https://feedback.strapi.io/).`,
  },
  {
    title: "Strapi logo pack and media kit",
    slug: "strapi-logo-pack",
    section: "reusable_content",
    minimum_level: "Unlisted",
    category: "Logos & brand kit",
    label: "SVG, PNG",
    icon: "shapes",
    link: "https://strapi.io/newsroom",
    sort_order: 0,
    description:
      "The Strapi logo in every format and colorway, plus our brand guidelines.",
    content: `Download the official logos and media kit from the [Strapi newsroom](https://strapi.io/newsroom). Our [brand book](https://handbook.strapi.io/strapi-brand-book-2022) covers colors, typography and how to use the logo.

Use the files from the newsroom as they are, and follow the brand book when you place the logo next to your own.

Community partners and above also get a [partner badge](./partner-badge-all-tiers) for their level. Publishing something about Strapi? The [co-marketing program](./co-marketing) can help it reach more people.`,
  },
  {
    title: "Partner badges",
    slug: "partner-badge-all-tiers",
    section: "reusable_content",
    minimum_level: "Community",
    category: "Logos & brand kit",
    label: "SVG",
    icon: "badge-check",
    sort_order: 1,
    description:
      "Show your Strapi partner level on your website and in proposals.",
    content: `Community, Business and Enterprise partners can display the Strapi partner badge for their current level.

Download the badge for your level and put it on your website, in proposals and in pitch decks. Link it to your profile on the [Strapi partner directory](https://strapi.io/partners) or to [strapi.io](https://strapi.io). A link from your site to strapi.io is also one of the ecosystem requirements for your level.

Use the badge that matches your current level. If your level changes, swap the badge. Don't edit the badge or use it for a level you don't hold.`,
  },
  {
    title: "Strapi partner deck",
    slug: "strapi-partner-deck",
    section: "reusable_content",
    minimum_level: "Unlisted",
    category: "Sales decks",
    label: "PDF",
    icon: "presentation",
    sort_order: 2,
    description:
      "The official Strapi deck to use when you introduce Strapi to clients.",
    content: `The official Strapi deck covers what Strapi is, who uses it and how it's sold. Use the slides you need in your own pitch.

Please don't change the Strapi slides themselves. If something's out of date or missing for your market, tell us at [partners@strapi.io](mailto:partners@strapi.io).

For proof points to go with it, see the [partner sales playbook](../sales-enablement/partner-sales-playbook) and [customer stories](https://strapi.io/user-stories).`,
  },
  {
    title: "Co-marketing program",
    slug: "co-marketing",
    section: "reusable_content",
    minimum_level: "Unlisted",
    category: "Co-marketing",
    label: "Guide",
    icon: "megaphone",
    link: "mailto:partners@strapi.io?subject=Co-marketing%20request",
    sort_order: 3,
    description:
      "Get your Strapi work in front of Strapi's audience: social posts, guest blog posts, events and case studies.",
    content: `Community, Business and Enterprise partners can use the co-marketing program. You create the content, we review it and share it on Strapi's channels.

Send us finished work. We review and promote content, but we don't write or edit it for you.

To submit anything, email [partners@strapi.io](mailto:partners@strapi.io) with the type of request, the content or a link to it, and any dates we need to know.

## Social media

The fastest way: post it on your own LinkedIn or X account first, then send us the link and we'll reshare it.

If resharing won't work, send us the final post copy, images or video, and every link it needs, and we'll publish a new post from Strapi's accounts.

Good topics include practical Strapi tips, short client results ("how we cut page load time by 28% for a retailer"), plugin demos, and your Strapi events.

## Guest blog posts

We publish partner posts on the Strapi blog with your company name and a link to your site.

1. Pick a topic. Our [community content repo](https://github.com/strapi/community-content/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Partner%20Post%22) lists ideas we're looking for; issues labeled P2 or P3 are the current priorities.
2. Write 800 to 1,200 words, with code snippets or screenshots where they help.
3. Send us the finished draft. Our content team reviews it, may suggest changes and optimizes it for search.
4. We publish and promote it, and you share it too.

Strong topics are migrations from a legacy CMS, integrations with commerce, CRM or analytics tools, scaling high-traffic sites, multi-region setups and custom plugins.

## Events

Strapi lists community events on its [Luma calendar](https://luma.com/strapi). To add yours, click **Submit Event** on the calendar page. Create the event in Luma, or choose **External Event** and add the link if it's on Meetup or elsewhere. We review submissions and may promote selected events in our newsletter and on social media.

Events should be clearly about Strapi. Hands-on demos and live coding go down best with developers.

Strapi also runs and attends events around the world, listed on the same calendar. Come and say hello.

## Case studies

A case study shows how you delivered a Strapi project for a real client, with the problem, the solution and measurable results. We publish approved case studies on strapi.io and use them in our own marketing.

Use this outline:

1. **Overview**: your agency, the client, their industry, project length and tech stack
2. **The challenge**: what problem the client had, why they chose Strapi, and any specific requirements
3. **The solution**: how you implemented Strapi, the content model, plugins and integrations
4. **Implementation**: the main steps, how you worked, and problems you solved along the way
5. **Results**: performance, editorial and business results, with numbers, plus a client quote if you can get one
6. **Technical detail**: architecture, performance work and security, with diagrams or code where useful
7. **Lessons learned**: what you'd recommend to others building something similar
8. **About your agency**: a short description, your services and a call to action

For inspiration, see how [PostHog](https://strapi.io/user-stories/posthog), [Yuka](https://strapi.io/user-stories/yuka-moves-fast-with-strapi-cloud) and [Tesco](https://strapi.io/user-stories/tesco) use Strapi.

A published blog post or case study on your own site, or on the Strapi blog, also counts as a marketing contribution towards your partner level.`,
  },
];

/**
 * Creates the partner resources as drafts, only while the collection is
 * still empty. They're reviewed and published in the admin panel, and the
 * seeder never touches them again.
 */
export async function seedPartnerResources(strapi: Core.Strapi): Promise<void> {
  const documents = strapi.documents("api::partner-resource.partner-resource");

  if ((await documents.count({})) > 0) return;

  for (const seed of seeds) {
    await documents.create({ data: seed });
  }

  strapi.log.info(`[seed] Created ${seeds.length} partner resources (drafts)`);
}

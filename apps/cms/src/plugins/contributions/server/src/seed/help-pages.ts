import type { Core } from "@strapi/strapi";
import {
  CONTRIBUTION_POINTS,
  CONTRIBUTIONS_SINCE,
  CONTRIBUTOR_TIERS,
} from "../utils/contributor-tiers";

/** Where contributions count, as Markdown links. */
const whereLinks =
  "every repository of the [strapi](https://github.com/strapi) and [strapi-community](https://github.com/strapi-community) organizations";

/** e.g. "September 18, 2024" */
const contributionsSince = new Date(CONTRIBUTIONS_SINCE).toLocaleDateString(
  "en-US",
  { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" },
);

/**
 * Seeds the "Contributing" help pages, which explain contributor tiers and
 * the GitHub contributions shown on profiles. Like the email template
 * seeder, a page is only created when no page with its slug exists yet —
 * editors own the content from then on, and re-running never overwrites
 * their changes. Pages are created published.
 */

type SeedHelpPage = {
  slug: string;
  title: string;
  description: string;
  content: string;
  children?: SeedHelpPage[];
};

const tierTable = [
  "| Tier | Points needed |",
  "| --- | --- |",
  ...CONTRIBUTOR_TIERS.map(
    ({ label, minScore }) =>
      `| **${label}** | ${minScore.toLocaleString("en-US")}+ |`,
  ),
].join("\n");

const githubPointsTable = [
  "| Contribution | Counts when | In strapi | In strapi-community |",
  "| --- | --- | --- | --- |",
  `| Pull request | it's merged | ${CONTRIBUTION_POINTS.mergedPullRequest} | ${CONTRIBUTION_POINTS.communityMergedPullRequest} |`,
  `| Issue | a merged pull request (or a maintainer's commit) resolved it | ${CONTRIBUTION_POINTS.resolvedIssue} | ${CONTRIBUTION_POINTS.communityResolvedIssue} |`,
  `| Discussion answer | it's marked as the accepted answer | ${CONTRIBUTION_POINTS.acceptedAnswer} | ${CONTRIBUTION_POINTS.communityAcceptedAnswer} |`,
].join("\n");

const hubPointsTable = [
  "| Contribution | Counts when | Points |",
  "| --- | --- | --- |",
  `| Plugin | it's approved and published | ${CONTRIBUTION_POINTS.publishedPlugin} |`,
  `| Template | it's approved and published | ${CONTRIBUTION_POINTS.publishedTemplate} |`,
].join("\n");

const seeds: SeedHelpPage[] = [
  {
    slug: "contributing",
    title: "Contributing to Strapi",
    description:
      "How your contributions to Strapi are recognized across the community — on your profile and in the members directory.",
    content: `Strapi is built in the open, together with its community. Every issue you report, discussion you start and pull request that gets merged makes Strapi better — and we want that work to be visible.

When you connect your GitHub account, your contributions to ${whereLinks} show up on your community profile, and the ones that made a difference — merged pull requests, fixed issues and accepted answers — earn you a **contributor tier**.

## Where your contributions count

- **[strapi](https://github.com/strapi)** — the Strapi core ([strapi/strapi](https://github.com/strapi/strapi)), and everything around it: the documentation, the design system, the SDKs, the Blocks React renderer, the official templates and more. Every repository in the organization counts, including new ones.
- **[strapi-community](https://github.com/strapi-community)** — community-maintained plugins, providers and tools, like Better Auth, REST Cache, Redis, the Google Cloud Storage upload provider and the Dockerize tool. Every repository in the organization counts, including new ones.

Both count, but work on Strapi itself counts most: a contribution to a strapi repository earns more community points than the same contribution to a strapi-community one.

## What you get

- **A GitHub Contributions tab on your profile**, listing your issues, pull requests and discussions.
- **A contributor tier badge** on your profile and on your card in the members directory.
- **A spot in the members directory filters**, so others can find contributors by tier.
- **Your tier as a role on the Strapi Discord server**, once you connect your Discord account.
- **Your community points**, under **Community points** in your user menu: your tier, how close you are to the next one, where your points come from, what each tier unlocks, and issues you could pick up next.

## Get started

1. Sign in and connect your GitHub account under **Account → Security**.
2. Make sure **Show GitHub contributions** is checked under **Account → Profile** (it is by default).
3. Contribute! Your tier is updated daily.

New to contributing? The [contributing guide](https://github.com/strapi/strapi/blob/develop/CONTRIBUTING.md) explains how to set up Strapi locally, and issues labeled [good first issue](https://github.com/strapi/strapi/labels/good%20first%20issue) are a great place to start. Community plugins in [strapi-community](https://github.com/strapi-community) are often smaller codebases — a friendly place for a first pull request.`,
    children: [
      {
        slug: "contributor-tiers",
        title: "Contributor tiers",
        description:
          "How contributor tiers work, how many community points each contribution is worth, and how your tier is calculated.",
        content: `Contributor tiers recognize members who help build Strapi and its ecosystem. Your tier is based on your contributions to ${whereLinks}, and is shown on your profile and your card in the members directory.

## The tiers

${tierTable}

## How community points are earned

Your contributions to strapi and strapi-community repositories, and the plugins and templates you publish on the Community Hub, earn community points once they've **made a difference** — not just for being opened or submitted.

### On GitHub

Work on Strapi itself — any repository of the [strapi](https://github.com/strapi) organization — earns the most. Contributions to community-maintained [strapi-community](https://github.com/strapi-community) repositories count too, for fewer points.

${githubPointsTable}

### On the Community Hub

${hubPointsTable}

- **Pull requests** count once they're merged — that's when your code becomes part of Strapi.
- **Issues** count once they're fixed: when a merged pull request or a commit by the maintainers resolves them. Reporting a real bug that gets fixed is a valuable contribution; issues that are closed as duplicates, invalid or not planned don't earn points.
- **Discussion answers** count when your reply to someone's question is marked as the accepted answer.
- **Plugins and templates** count once they're approved and published on the Community Hub. They count for you when you own them personally — not when they're owned by an organization, or when you're one of their maintainers. You don't need a GitHub account for these.

Only contributions from the **Strapi 5 era** count: pull requests merged, issues fixed, answers accepted and plugins or templates submitted since Strapi 5 was released on ${contributionsSince}. Tiers celebrate the people building Strapi today.

For example, 2 merged pull requests, 3 fixed issues and 4 accepted answers in strapi repositories add up to ${
          2 * CONTRIBUTION_POINTS.mergedPullRequest +
          3 * CONTRIBUTION_POINTS.resolvedIssue +
          4 * CONTRIBUTION_POINTS.acceptedAnswer
        } points.

## Your tier on Discord

Connect your Discord account under **Account → Security** and you get the role of your tier — Bronze, Silver, Gold or Platinum Contributor — on the [Strapi Discord server](https://discord.strapi.io). It follows your tier automatically: when you reach a new tier, your role moves up with you. You need to be a member of the server; if you join after connecting, your role is added within a day.

## When is my tier updated?

Tiers are recalculated **once a day**. To see your progress sooner, open **Community points** from your user menu and click **Refresh** (once every 15 minutes). Saving your profile settings also recalculates your tier right away.

## Why don't I have a tier?

- **Your GitHub account isn't connected.** Connect it under **Account → Security**.
- **You've hidden your GitHub contributions.** Tiers are based on the same contributions shown on your profile, so hiding them also hides your tier. Turn **Show GitHub contributions** back on under **Account → Profile**.
- **Your contributions haven't been validated yet.** Open pull requests, issues that haven't been fixed yet and unanswered questions don't count — yet. One merged pull request, fixed issue or accepted answer is enough to become a ${CONTRIBUTOR_TIERS[0].label}.
- **It hasn't been a day yet.** New contributions are picked up by the next daily update.
- **You work at Strapi.** Tiers celebrate the community's contributions, so Strapi employees don't get one — their profile shows a Strapi employee tag instead.`,
      },
      {
        slug: "github-contributions",
        title: "Showing your GitHub contributions",
        description:
          "Connect your GitHub account to show your issues, pull requests and discussions in Strapi and strapi-community repositories on your profile.",
        content: `Your community profile can show the work you've done in ${whereLinks} in a **GitHub Contributions** tab.

## What's shown

- The number of **issues**, **pull requests** and **discussions** you've authored, each linking to the full list on GitHub.
- Your **recent activity**, newest first, with the repository and state of each item (open, closed, merged or answered).
- Your **contributor tier**, and how far you are from the next one.

Only public activity in strapi and strapi-community repositories is shown. Your profile shows all of it — your contributor tier only counts the validated contributions from the Strapi 5 era (see Contributor tiers).

## Turn it on

1. Sign in and go to **Account → Security**.
2. Connect your **GitHub** account.
3. Your contributions appear on your profile automatically — the tab only shows up once you have at least one contribution.

## Turn it off

Uncheck **Show GitHub contributions** under **Account → Profile**. The tab disappears from your profile and your contributor tier is removed. You can turn it back on at any time.`,
      },
    ],
  },
];

async function seedPage(
  strapi: Core.Strapi,
  seed: SeedHelpPage,
  parentDocumentId?: string,
): Promise<void> {
  const { children, ...data } = seed;

  let page = await strapi
    .documents("api::help-page.help-page")
    .findFirst({ filters: { slug: seed.slug }, fields: ["documentId"] });

  if (!page) {
    page = await strapi.documents("api::help-page.help-page").create({
      data: { ...data, parent: parentDocumentId },
      status: "published",
    });

    strapi.log.info(`[seed] Created help page: ${seed.slug}`);
  }

  for (const child of children ?? []) {
    await seedPage(strapi, child, page.documentId);
  }
}

export async function seedHelpPages(strapi: Core.Strapi): Promise<void> {
  for (const seed of seeds) {
    await seedPage(strapi, seed);
  }
}

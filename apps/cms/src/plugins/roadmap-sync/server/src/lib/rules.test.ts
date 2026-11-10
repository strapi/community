import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  blockingReasons,
  compareVersions,
  extractUrls,
  isPrivateAddress,
  type LinkCheck,
  mapNotionPage,
  mapStatus,
  mapTimeframe,
  type NotionPage,
  normalizeVersion,
  parseCannyUrl,
  parseGitHubIssueUrl,
  slugify,
  stableStringify,
  toPublicFields,
  uniqueSlug,
} from "./rules.ts";

const text = (s: string) => [{ plain_text: s }];

function page(overrides: NotionPage["properties"] = {}): NotionPage {
  return {
    id: "11111111-2222-3333-4444-555555555555",
    url: "https://www.notion.so/abc",
    properties: {
      Name: { type: "title", title: text("Public title") },
      "Public description": {
        type: "rich_text",
        rich_text: text("What it does"),
      },
      Status: { type: "status", status: { name: "In delivery - late" } },
      "When?": { type: "select", select: { name: "Now" } },
      "Delivery Quarter": { type: "select", select: { name: "Q4 2026" } },
      Squad: { type: "multi_select", multi_select: [{ name: "CMS core" }] },
      Tags: { type: "multi_select", multi_select: [{ name: "New Feature" }] },
      "Canny Link": {
        type: "url",
        url: "https://feedback.strapi.io/feature-requests/p/foo",
      },
      "GitHub links": {
        type: "rich_text",
        rich_text: text(
          "https://github.com/strapi/strapi/issues/1, https://github.com/strapi/strapi/pull/2\nhttps://github.com/strapi/strapi/issues/1",
        ),
      },
      "Docs link": { type: "url", url: "https://docs.strapi.io/" },
      "Public Roadmap": { type: "checkbox", checkbox: true },
      "Version & date (Release)": {
        type: "select",
        select: { name: "v5.61.1" },
      },
      // Internal-only fields that must never be read.
      Comments: { type: "rich_text", rich_text: text("customer X is angry") },
      ...overrides,
    },
  };
}

describe("mapStatus", () => {
  it("maps every internal status per the proposal", () => {
    assert.equal(mapStatus("Not started"), "exploring");
    assert.equal(mapStatus("In product discovery"), "exploring");
    assert.equal(mapStatus("In tech discovery"), "exploring");
    assert.equal(mapStatus("Ready to dev"), "in_progress");
    assert.equal(mapStatus("In delivery - on track"), "in_progress");
    assert.equal(mapStatus("In delivery - late"), "in_progress");
    assert.equal(mapStatus("In Beta Release"), "beta");
    assert.equal(mapStatus("Done"), "shipped");
    assert.equal(mapStatus("Paused"), null);
    assert.equal(mapStatus("Something new"), null);
    assert.equal(mapStatus(null), null);
  });
});

describe("mapTimeframe", () => {
  it("lowercases known values and rejects others", () => {
    assert.equal(mapTimeframe("Now"), "now");
    assert.equal(mapTimeframe("TBD"), "tbd");
    assert.equal(mapTimeframe("Someday"), null);
    assert.equal(mapTimeframe(null), null);
  });
});

describe("mapNotionPage", () => {
  it("copies public fields verbatim and maps status", () => {
    const row = mapNotionPage(page());
    assert.equal(row.publicTitle, "Public title");
    assert.equal(row.publicDescription, "What it does");
    assert.equal(row.publicStatus, "in_progress");
    assert.equal(row.timeframe, "now");
    assert.equal(row.deliveryQuarter, "Q4 2026");
    assert.deepEqual(row.squads, ["CMS core"]);
    assert.deepEqual(row.tags, ["New Feature"]);
    assert.deepEqual(row.githubLinks, [
      "https://github.com/strapi/strapi/issues/1",
      "https://github.com/strapi/strapi/pull/2",
    ]);
    assert.equal(row.flagged, true);
    assert.equal(row.release, "5.61.1");
    assert.equal(toPublicFields(row).release, "5.61.1");
  });

  it("never stores internal-only values", () => {
    const stored = JSON.stringify(toPublicFields(mapNotionPage(page())));
    assert.doesNotMatch(stored, /customer X/);
    assert.doesNotMatch(stored, /late/i);
    assert.match(stored, /"public_status":"in_progress"/);
  });

  it("treats whitespace-only text as missing", () => {
    const row = mapNotionPage(
      page({ Name: { type: "title", title: text("   ") } }),
    );
    assert.equal(row.publicTitle, null);
  });

  it("tolerates missing properties", () => {
    const row = mapNotionPage({ id: "x", properties: {} });
    assert.equal(row.publicTitle, null);
    assert.equal(row.flagged, false);
    assert.deepEqual(row.squads, []);
  });
});

describe("blockingReasons", () => {
  const ok: LinkCheck = { url: "https://a", result: "ok" };

  it("passes a complete flagged row", () => {
    assert.deepEqual(blockingReasons(mapNotionPage(page()), [ok]), []);
  });

  it("fails closed on missing copy", () => {
    const row = mapNotionPage(
      page({
        Name: { type: "title", title: [] },
        "Public description": { type: "rich_text", rich_text: [] },
      }),
    );
    assert.deepEqual(blockingReasons(row, []), [
      "missing_title",
      "missing_description",
    ]);
  });

  it("blocks paused and unknown statuses", () => {
    const paused = mapNotionPage(
      page({ Status: { type: "status", status: { name: "Paused" } } }),
    );
    assert.deepEqual(blockingReasons(paused, []), ["paused"]);
    const unknown = mapNotionPage(
      page({ Status: { type: "status", status: { name: "Brand new" } } }),
    );
    assert.deepEqual(blockingReasons(unknown, []), ["unmapped_status"]);
  });

  it("blocks broken links but not unverified ones", () => {
    const row = mapNotionPage(page());
    assert.deepEqual(
      blockingReasons(row, [{ url: "https://x", result: "unverified" }]),
      [],
    );
    assert.deepEqual(
      blockingReasons(row, [{ url: "https://x", result: "broken" }]),
      ["broken_link"],
    );
  });

  it("blocks unflagged and archived rows", () => {
    const row = mapNotionPage(
      page({ "Public Roadmap": { type: "checkbox", checkbox: false } }),
    );
    assert.deepEqual(blockingReasons(row, [], true), [
      "not_flagged",
      "archived",
    ]);
  });
});

describe("slugs", () => {
  it("slugifies titles", () => {
    assert.equal(slugify("Préview mode — v2!"), "preview-mode-v2");
    assert.equal(slugify("   "), "");
  });
  it("finds the first free slug", () => {
    assert.equal(uniqueSlug("a", new Set()), "a");
    assert.equal(uniqueSlug("a", new Set(["a", "a-2"])), "a-3");
    assert.equal(uniqueSlug("", new Set()), "roadmap-item");
  });
});

describe("URL parsing", () => {
  it("parses Canny public and admin URLs", () => {
    assert.deepEqual(
      parseCannyUrl("https://feedback.strapi.io/feature-requests/p/dark-mode"),
      { boardUrlName: "feature-requests", postUrlName: "dark-mode" },
    );
    assert.deepEqual(
      parseCannyUrl(
        "https://strapi.canny.io/admin/board/feature-requests/p/dark-mode",
      ),
      { boardUrlName: "feature-requests", postUrlName: "dark-mode" },
    );
    assert.equal(parseCannyUrl("https://feedback.strapi.io/"), null);
    assert.equal(parseCannyUrl("not a url"), null);
    assert.equal(
      parseCannyUrl("javascript://feedback.strapi.io/feature-requests/p/x"),
      null,
    );
    assert.equal(parseCannyUrl("data:text/html,/feature-requests/p/x"), null);
  });

  it("parses GitHub issue and PR URLs only", () => {
    assert.deepEqual(
      parseGitHubIssueUrl("https://github.com/strapi/strapi/pull/42/files"),
      { owner: "strapi", repo: "strapi", number: 42 },
    );
    assert.equal(parseGitHubIssueUrl("https://github.com/strapi/strapi"), null);
    assert.equal(parseGitHubIssueUrl("https://gitlab.com/a/b/issues/1"), null);
  });

  it("extracts and dedupes URLs from free text", () => {
    assert.deepEqual(extractUrls("see https://a.io/x. and (https://b.io/y)"), [
      "https://a.io/x",
      "https://b.io/y",
    ]);
  });
});

describe("stableStringify", () => {
  it("ignores key order and undefined", () => {
    assert.equal(
      stableStringify({ b: 1, a: [1, { d: 2, c: undefined }] }),
      stableStringify({ a: [1, { d: 2 }], b: 1 }),
    );
  });
});

describe("versions", () => {
  it("normalises tags, milestone titles and free text", () => {
    assert.equal(normalizeVersion("v5.61.1"), "5.61.1");
    assert.equal(normalizeVersion("5.62"), "5.62");
    assert.equal(normalizeVersion("Strapi v5.60.0 (Oct 28)"), "5.60.0");
    assert.equal(normalizeVersion("Backlog"), null);
    assert.equal(normalizeVersion(null), null);
  });

  it("compares numerically, not lexically", () => {
    const sorted = ["5.10.1", "5.9", "5.10", "5.61.1", "5.61"].sort(
      compareVersions,
    );
    assert.deepEqual(sorted, ["5.9", "5.10", "5.10.1", "5.61", "5.61.1"]);
  });
});

describe("isPrivateAddress", () => {
  it("blocks loopback, private, link-local, metadata and reserved ranges", () => {
    for (const ip of [
      "127.0.0.1",
      "10.1.2.3",
      "172.16.0.1",
      "172.31.255.255",
      "192.168.1.10",
      "169.254.169.254",
      "100.64.0.1",
      "0.0.0.0",
      "224.0.0.1",
      "::1",
      "::",
      "fd00::1",
      "fe80::1",
      "::ffff:127.0.0.1",
      "::ffff:7f00:1", // hex v4-mapped loopback
      "::ffff:a9fe:a9fe", // hex v4-mapped metadata
      "::127.0.0.1", // v4-compatible
      "::7f00:1",
      "64:ff9b::a9fe:a9fe", // NAT64 → metadata
      "2002:7f00:1::", // 6to4 → loopback
      "2001:0:4136:e378::", // Teredo
      "fec0::1",
      "ff02::1",
      "255.255.255.255",
      "not-an-ip",
    ]) {
      assert.equal(isPrivateAddress(ip), true, ip);
    }
  });

  it("allows public addresses", () => {
    for (const ip of [
      "140.82.112.3",
      "172.32.0.1",
      "8.8.8.8",
      "2606:4700::1111",
      "2a00:1450:4001:80b::200e",
      "::ffff:8.8.8.8",
    ]) {
      assert.equal(isPrivateAddress(ip), false, ip);
    }
  });
});

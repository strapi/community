import { describe, expect, it } from "vitest";
import {
  MAX_PROFILE_LINKS,
  pickProfileLinks,
  validateProfileLinks,
} from "./profile-links";

describe("pickProfileLinks", () => {
  it("keeps only type and a trimmed value", () => {
    expect(
      pickProfileLinks([
        { id: 12, type: "github", value: "  octocat  ", extra: true },
      ]),
    ).toEqual([{ type: "github", value: "octocat" }]);
  });

  it("turns null into an empty list", () => {
    expect(pickProfileLinks(null)).toEqual([]);
  });

  it("leaves non-array input for validation to reject", () => {
    expect(pickProfileLinks("github.com/octocat")).toBe("github.com/octocat");
  });
});

describe("validateProfileLinks", () => {
  it("accepts an empty list", () => {
    expect(validateProfileLinks([])).toEqual([]);
  });

  it("accepts valid handles and URLs, including duplicate types", () => {
    expect(
      validateProfileLinks([
        { type: "github", value: "octocat" },
        { type: "linkedin", value: "jane-doe" },
        { type: "x", value: "jane_doe" },
        { type: "instagram", value: "jane.doe" },
        { type: "youtube", value: "janedoe" },
        { type: "linktree", value: "janedoe" },
        { type: "website", value: "https://example.com" },
        { type: "website", value: "http://blog.example.com/path" },
        { type: "other", value: "https://www.npmjs.com/~octocat" },
      ]),
    ).toEqual([]);
  });

  it.each([
    ["github", "https://github.com/octocat", "GitHub"],
    ["github", "-octocat", "GitHub"],
    ["x", "way_too_long_for_x_handle", "X (Twitter)"],
    ["linkedin", "ab", "LinkedIn"],
    ["youtube", "@janedoe", "YouTube"],
  ])("rejects %s handle %j", (type, value, label) => {
    const errors = validateProfileLinks([{ type, value }]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/^Link 1: Enter a /);
    expect(errors[0]).toContain(`${label} username`);
  });

  it.each([
    "example.com",
    "ftp://example.com",
    "https://localhost",
  ])("rejects web address %j", (value) => {
    expect(validateProfileLinks([{ type: "website", value }])).toEqual([
      "Link 1: Enter a full web address, like https://example.com.",
    ]);
  });

  it("numbers errors by position", () => {
    expect(
      validateProfileLinks([
        { type: "github", value: "octocat" },
        { type: "facebook", value: "jane" },
        { type: "x", value: "" },
      ]),
    ).toEqual([
      "Link 2: Choose a link type.",
      "Link 3: Enter an address or username.",
    ]);
  });

  it(`rejects more than ${MAX_PROFILE_LINKS} links`, () => {
    const links = Array.from({ length: MAX_PROFILE_LINKS + 1 }, () => ({
      type: "github",
      value: "octocat",
    }));
    expect(validateProfileLinks(links)).toEqual([
      `Add up to ${MAX_PROFILE_LINKS} links.`,
    ]);
  });

  it("rejects anything that isn't a list", () => {
    expect(validateProfileLinks({ type: "github" })).toEqual([
      "Links must be a list.",
    ]);
  });
});

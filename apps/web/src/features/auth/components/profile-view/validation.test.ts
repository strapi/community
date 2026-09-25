import { describe, expect, it } from "vitest";
import {
  BIO_MAX_LENGTH,
  SUBTITLE_MAX_LENGTH,
  validateProfileField,
} from "./validation";

describe("validateProfileField", () => {
  it("treats empty and whitespace-only values as valid", () => {
    expect(validateProfileField("website", "")).toBeUndefined();
    expect(validateProfileField("website", "   ")).toBeUndefined();
    expect(validateProfileField("website", null)).toBeUndefined();
  });

  it("enforces the bio and subtitle length limits", () => {
    expect(
      validateProfileField("bio", "a".repeat(BIO_MAX_LENGTH)),
    ).toBeUndefined();
    expect(
      validateProfileField("bio", "a".repeat(BIO_MAX_LENGTH + 1)),
    ).toBeDefined();
    expect(
      validateProfileField("subtitle", "a".repeat(SUBTITLE_MAX_LENGTH + 1)),
    ).toBeDefined();
  });

  it("validates website, github and email formats", () => {
    expect(
      validateProfileField("website", "https://example.com"),
    ).toBeUndefined();
    expect(validateProfileField("website", "example.com")).toBeDefined();
    expect(
      validateProfileField("github", "https://github.com/octocat"),
    ).toBeUndefined();
    expect(
      validateProfileField("github", "https://github.com/octocat/repo"),
    ).toBeDefined();
    expect(validateProfileField("email", "jane@example.com")).toBeUndefined();
    expect(validateProfileField("email", "jane@example")).toBeDefined();
  });

  it("ignores fields without a rule", () => {
    expect(validateProfileField("location", "anything")).toBeUndefined();
  });
});

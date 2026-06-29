import { describe, expect, it } from "vitest";
import { deriveGlobalGrantsFromGroups } from "./eligibility.js";

describe("eligibility", () => {
  it("derives grants from groups", () => {
    const grants = deriveGlobalGrantsFromGroups(["REVOLUTION_VIEWERS"]);
    expect(grants).toContain("projects.read");
  });
});

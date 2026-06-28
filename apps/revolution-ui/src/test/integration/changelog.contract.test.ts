import { describe, expect, it } from "vitest";
import { changelog } from "../../changelog";

describe("changelog release contract", () => {
  it("requires commit references for all live entries", () => {
    const liveEntries = changelog.filter((entry) => entry.status === "Live");
    expect(liveEntries.length).toBeGreaterThan(0);

    for (const entry of liveEntries) {
      expect(entry.commitRefs?.length ?? 0).toBeGreaterThan(0);
    }
  });
});

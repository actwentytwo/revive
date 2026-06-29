import { describe, expect, it } from "vitest";
import { resolveFunctionalGroups } from "./groupResolver.js";

describe("resolveFunctionalGroups", () => {
  it("returns parsed groups from header", () => {
    const groups = resolveFunctionalGroups({
      header: (name) =>
        name === "x-functional-groups" ? "REVOLUTION_VIEWERS,REVOLUTION_OPERATORS" : undefined,
      hostname: "localhost",
    });
    expect(groups).toEqual(["REVOLUTION_VIEWERS", "REVOLUTION_OPERATORS"]);
  });
});

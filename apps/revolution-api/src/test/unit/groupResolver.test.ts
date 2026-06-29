import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveFunctionalGroups } from "../../auth/groupResolver.js";

describe("resolveFunctionalGroups", () => {
  afterEach(() => {
    delete process.env.DEV_LOCALHOST_BYPASS_FUNCTIONAL_GROUPS;
    vi.unstubAllEnvs();
  });

  it("uses x-functional-groups header when present", () => {
    const groups = resolveFunctionalGroups({
      header: (name) =>
        name === "x-functional-groups" ? "REVOLUTION_OPERATORS, REVOLUTION_VIEWERS" : undefined,
      hostname: "api.localhost",
    });

    expect(groups).toEqual(["REVOLUTION_OPERATORS", "REVOLUTION_VIEWERS"]);
  });

  it("uses localhost bypass groups when headers are absent", () => {
    vi.stubEnv(
      "DEV_LOCALHOST_BYPASS_FUNCTIONAL_GROUPS",
      "REVOLUTION_PLATFORM_ADMINS,REVOLUTION_OPERATORS",
    );

    const groups = resolveFunctionalGroups({
      header: () => undefined,
      hostname: "localhost",
    });

    expect(groups).toEqual(["REVOLUTION_PLATFORM_ADMINS", "REVOLUTION_OPERATORS"]);
  });

  it("does not use bypass groups outside localhost", () => {
    vi.stubEnv("DEV_LOCALHOST_BYPASS_FUNCTIONAL_GROUPS", "REVOLUTION_PLATFORM_ADMINS");

    const groups = resolveFunctionalGroups({
      header: () => undefined,
      hostname: "revolution.internal",
    });

    expect(groups).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { appRouter } from "../../router.js";

describe("app router health", () => {
  it("returns an ok health payload", async () => {
    const caller = appRouter.createCaller({});
    const result = await caller.health();

    expect(result.ok).toBe(true);
    expect(typeof result.generatedAt).toBe("string");
  });
});

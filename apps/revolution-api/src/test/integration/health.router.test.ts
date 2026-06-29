import { describe, expect, it } from "vitest";
import { appRouter } from "../../router.js";
import type { TrpcContext } from "../../trpc/trpc.context.js";

const testContext: TrpcContext = {
  requestId: "test-request-id",
  actorType: null,
  identity: null,
  functionalGroups: [],
  grants: [],
  getHeader: () => undefined,
};

describe("app router health", () => {
  it("returns an ok health payload", async () => {
    const caller = appRouter.createCaller(testContext);
    const result = await caller.health();

    expect(result.ok).toBe(true);
    expect(typeof result.generatedAt).toBe("string");
  });
});

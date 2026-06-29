import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { appRouter } from "../../router.js";
import type { TrpcContext } from "../../trpc/trpc.context.js";

const unauthenticatedContext: TrpcContext = {
  requestId: "test-unauth",
  actorType: null,
  identity: null,
  functionalGroups: [],
  grants: [],
  getHeader: () => undefined,
};

const authenticatedContext: TrpcContext = {
  requestId: "test-auth",
  actorType: "human",
  identity: {
    subject: "CN=Operator One,OU=users,O=Example",
    cn: "Operator One",
  },
  functionalGroups: ["REVOLUTION_OPERATORS"],
  grants: ["projects.read"],
  getHeader: () => undefined,
};

describe("meta router auth", () => {
  it("rejects whoAmI without identity", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext);
    await expect(caller.meta.whoAmI()).rejects.toBeInstanceOf(TRPCError);
  });

  it("returns session data for authenticated caller", async () => {
    const caller = appRouter.createCaller(authenticatedContext);
    const result = await caller.meta.session();

    expect(result.requestId).toBe("test-auth");
    expect(result.identity?.subject).toContain("CN=Operator One");
    expect(result.grants).toContain("projects.read");
  });
});

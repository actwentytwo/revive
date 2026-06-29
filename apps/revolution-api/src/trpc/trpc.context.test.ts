import { describe, expect, it } from "vitest";
import { createContext } from "./trpc.context.js";

describe("createContext", () => {
  it("builds context from request headers", async () => {
    const ctx = await createContext({
      requestId: "req-1",
      req: {
        hostname: "localhost",
        header: (name) =>
          name === "x-forwarded-tls-client-cert-subject"
            ? "CN=Alice,OU=users,O=Example Corp"
            : name === "x-functional-groups"
              ? "REVOLUTION_VIEWERS"
              : undefined,
      },
    });

    expect(ctx.requestId).toBe("req-1");
    expect(ctx.identity?.subject).toContain("CN=Alice");
  });
});

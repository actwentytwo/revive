import { describe, expect, it } from "vitest";
import { extractIdentityFromRequest } from "./pkiAuth.js";

describe("extractIdentityFromRequest", () => {
  it("parses identity from forwarded headers", () => {
    const identity = extractIdentityFromRequest({
      header: (name) =>
        name === "x-forwarded-tls-client-cert-subject"
          ? "CN=Alice,OU=users,O=Example Corp"
          : undefined,
      hostname: "localhost",
    });

    expect(identity?.subject).toContain("CN=Alice");
  });
});

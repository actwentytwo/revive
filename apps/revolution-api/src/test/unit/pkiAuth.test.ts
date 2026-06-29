import { afterEach, describe, expect, it, vi } from "vitest";
import { extractIdentityFromRequest, type HeaderRequest } from "../../auth/pkiAuth.js";

const createRequest = (
  headers: Record<string, string | undefined>,
  hostname?: string,
): HeaderRequest => ({
  hostname,
  header: (name: string) => headers[name],
});

describe("extractIdentityFromRequest", () => {
  afterEach(() => {
    delete process.env.DEV_LOCALHOST_BYPASS_SUBJECT;
    vi.unstubAllEnvs();
  });

  it("extracts identity from forwarded certificate headers", () => {
    const identity = extractIdentityFromRequest(
      createRequest({
        "x-forwarded-tls-client-cert-subject": "CN=Alice,OU=users,O=Example Corp",
        "x-forwarded-tls-client-cert-issuer": "CN=Issuer,O=Example Corp",
        "x-forwarded-tls-client-cert-info": "SID=S-1-5-21-12345",
      }),
    );

    expect(identity).toEqual({
      subject: "CN=Alice,OU=users,O=Example Corp",
      issuer: "CN=Issuer,O=Example Corp",
      sid: "S-1-5-21-12345",
      cn: "Alice",
    });
  });

  it("uses localhost bypass subject when headers are absent", () => {
    vi.stubEnv("DEV_LOCALHOST_BYPASS_SUBJECT", "CN=Alice,OU=users,O=Example Corp");

    const identity = extractIdentityFromRequest(createRequest({}, "api.localhost"));

    expect(identity).toEqual({
      subject: "CN=Alice,OU=users,O=Example Corp",
      issuer: "development-localhost-bypass",
      cn: "Alice",
    });
  });

  it("does not use localhost bypass for non-localhost hosts", () => {
    vi.stubEnv("DEV_LOCALHOST_BYPASS_SUBJECT", "CN=Alice,OU=users,O=Example Corp");

    const identity = extractIdentityFromRequest(createRequest({}, "revolution.internal"));

    expect(identity).toBeNull();
  });
});

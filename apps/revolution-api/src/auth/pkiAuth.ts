import type { RevolutionIdentity } from "./identity.js";

export interface HeaderRequest {
  header: (name: string) => string | undefined;
}

function parseSid(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const sidMatch = value.match(/(?:^|[,\s])SID=([^\s,]+)/i);
  return sidMatch?.[1];
}

function parseCn(subject: string) {
  const cnMatch = subject.match(/(?:^|[,\s])CN=([^,]+)/i);
  return cnMatch?.[1]?.trim();
}

function parseEmail(subject: string) {
  const emailMatch = subject.match(/(?:^|[,\s])(?:E|EMAILADDRESS)=([^,]+)/i);
  return emailMatch?.[1]?.trim();
}

export function extractIdentityFromRequest(req: HeaderRequest): RevolutionIdentity | null {
  const subject =
    req.header("x-forwarded-tls-client-cert-subject") ?? req.header("ssl-client-subject-dn");

  if (!subject) {
    return null;
  }

  const issuer =
    req.header("x-forwarded-tls-client-cert-issuer") ?? req.header("ssl-client-issuer-dn");
  const info =
    req.header("x-forwarded-tls-client-cert-info") ?? req.header("x-forwarded-tls-client-cert");

  return {
    subject,
    ...(issuer ? { issuer } : {}),
    ...(parseSid(info) ? { sid: parseSid(info) } : {}),
    ...(parseCn(subject) ? { cn: parseCn(subject) } : {}),
    ...(parseEmail(subject) ? { emailAddress: parseEmail(subject) } : {}),
  };
}

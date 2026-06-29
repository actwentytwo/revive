import type { HeaderRequest } from "./pkiAuth.js";

export function resolveFunctionalGroups(req: HeaderRequest): string[] {
  const headerValue = req.header("x-functional-groups");
  if (headerValue) {
    return headerValue
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  const bypassGroups = (process.env.DEV_LOCALHOST_BYPASS_FUNCTIONAL_GROUPS ?? "").trim();
  const hostname = req.hostname?.toLowerCase();
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname?.endsWith(".localhost") === true;

  if (!bypassGroups || !isLocalhost) {
    return [];
  }

  return bypassGroups
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

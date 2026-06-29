import type { HeaderRequest } from "./pkiAuth.js";

export function resolveFunctionalGroups(req: HeaderRequest): string[] {
  const headerValue = req.header("x-functional-groups");
  if (!headerValue) {
    return [];
  }

  return headerValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

import type { Request } from "express";
import type { Permission as RevolutionPermission } from "../access/permissions.schemas.js";
import { resolveGrantsFromCatalog } from "../access/catalog.repository.js";
import type { RevolutionIdentity } from "../auth/identity.js";
import { resolveFunctionalGroups } from "../auth/groupResolver.js";
import { extractIdentityFromRequest, type HeaderRequest } from "../auth/pkiAuth.js";
import { resolveActorType } from "../auth/subjects.js";

export interface TrpcContext {
  requestId: string;
  actorType: "human" | "workload" | null;
  identity: RevolutionIdentity | null;
  functionalGroups: string[];
  grants: RevolutionPermission[];
  getHeader: (name: string) => string | undefined;
}

export async function createContext({
  req,
  requestId,
}: {
  req: HeaderRequest;
  requestId: string;
}): Promise<TrpcContext> {
  const identity = extractIdentityFromRequest(req);
  const actorType = resolveActorType(identity);
  const functionalGroups = resolveFunctionalGroups(req);
  const grants = await resolveGrantsFromCatalog(functionalGroups, identity?.subject);

  return {
    requestId,
    actorType,
    identity,
    functionalGroups,
    grants,
    getHeader: (name) => req.header(name),
  };
}

export function createHeaderRequestFromExpressRequest(req: Request): HeaderRequest {
  return {
    hostname: req.hostname,
    header: (name) => req.header(name) ?? undefined,
  };
}

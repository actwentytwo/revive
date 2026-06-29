import { useMemo } from "react";
import { trpc } from "../main";
import type { MyAccessSummary } from "../types/access";

type AccessPermissionKey = MyAccessSummary["effectivePermissions"][number]["permission"];

type AccessPermissionScope = {
  environmentKey?: string;
  clusterKey?: string;
};

const reasonMatchesScope = (scopeKey: string, scope?: AccessPermissionScope) => {
  if (!scope?.environmentKey) {
    return scopeKey === "global";
  }

  if (scopeKey === "global") {
    return true;
  }

  if (scope.clusterKey) {
    return (
      scopeKey === `environment:${scope.environmentKey}` ||
      scopeKey === `environment:${scope.environmentKey}:cluster:${scope.clusterKey}`
    );
  }

  return scopeKey === `environment:${scope.environmentKey}`;
};

export const useAccessPermissions = () => {
  const myAccess = trpc.access.myAccess.useQuery(undefined, { retry: false });
  const permissionGrants = useMemo(
    () => myAccess.data?.effectivePermissions ?? [],
    [myAccess.data?.effectivePermissions],
  );

  const canReal = (permission: AccessPermissionKey, scope?: AccessPermissionScope) => {
    const permissionGrant = permissionGrants.find((entry) => entry.permission === permission);
    if (!permissionGrant) {
      return false;
    }

    if (!scope) {
      return true;
    }

    return permissionGrant.reasons.some((reason) => reasonMatchesScope(reason.scopeKey, scope));
  };

  return {
    myAccess,
    can: canReal,
    canReal,
    grantedPermissions: new Set(permissionGrants.map((entry) => entry.permission)),
  };
};

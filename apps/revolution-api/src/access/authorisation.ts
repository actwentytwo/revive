import type { Permission as RevolutionPermission } from "./permissions.schemas.js";

export const hasPermission = (
  grants: RevolutionPermission[],
  requiredPermission: RevolutionPermission,
): boolean => grants.includes(requiredPermission);

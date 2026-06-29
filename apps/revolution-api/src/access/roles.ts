import { ROLE_CATALOG, ROLE_PERMISSION_CATALOG } from "./catalog.defaults.js";

export const rolePermissions = Object.fromEntries(
  ROLE_CATALOG.map((role) => [
    role.key,
    ROLE_PERMISSION_CATALOG.filter((entry) => entry.roleKey === role.key).map(
      (entry) => entry.permissionKey,
    ),
  ]),
);

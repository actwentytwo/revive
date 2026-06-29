import {
  permissionCatalogDefaults,
  procedureCatalogDefaults,
  roleCatalogDefaults,
  rolePermissionCatalogDefaults,
} from "./catalog.defaults.js";
import {
  listRolePermissionCatalogEntries,
  setRolePermissionsForRole,
} from "./catalog.repository.js";
import type {
  AuthorisationModelResponse,
  PermissionCatalogEntry,
  ProcedureDefinition,
  RoleCatalogEntry,
  RolePermissionCatalogEntry,
  UpdateRolePermissionsInput,
  UpdateRolePermissionsOutput,
} from "./catalog.schemas.js";

export type {
  PermissionCatalogEntry,
  ProcedureDefinition,
  RoleCatalogEntry,
  RolePermissionCatalogEntry,
} from "./catalog.schemas.js";

export const getAuthorisationModel = async (): Promise<AuthorisationModelResponse> => {
  const rolePermissionEntries = await listRolePermissionCatalogEntries();

  return {
    roles: roleCatalogDefaults.map((role) => {
      const permissions = rolePermissionEntries
        .filter((entry) => entry.roleKey === role.key)
        .map((entry) => entry.permissionKey);

      return {
        ...role,
        permissions: permissions.includes("*")
          ? permissionCatalogDefaults
              .map((permission) => permission.key)
              .filter((permission) => permission !== "*")
          : permissions,
      };
    }),
    permissions: permissionCatalogDefaults,
    procedures: procedureCatalogDefaults,
  };
};

export const getRolePermissionEntries = (): RolePermissionCatalogEntry[] =>
  rolePermissionCatalogDefaults;

export const getRoleCatalogEntries = (): RoleCatalogEntry[] => roleCatalogDefaults;

export const getPermissionCatalogEntries = (): PermissionCatalogEntry[] =>
  permissionCatalogDefaults;

export const getProcedureCatalogEntries = (): ProcedureDefinition[] => procedureCatalogDefaults;

export const updateRolePermissions = async (
  input: UpdateRolePermissionsInput,
): Promise<UpdateRolePermissionsOutput> => {
  await setRolePermissionsForRole(input.roleKey, input.permissionKeys);

  return {
    roleKey: input.roleKey,
    permissions: input.permissionKeys,
  };
};

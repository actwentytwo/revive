import type {
  PermissionCatalogEntry,
  ProcedureDefinition,
  RoleCatalogEntry,
  RolePermissionCatalogEntry,
} from "./catalog.schemas.js";

export const ROLE_CATALOG = [
  {
    key: "REVOLUTION_PLATFORM_ADMINS",
    description: "Platform administrators with full access.",
  },
  {
    key: "REVOLUTION_OPERATORS",
    description: "Operators who manage projects and configurations.",
  },
  {
    key: "REVOLUTION_VIEWERS",
    description: "Read-only users for project and video visibility.",
  },
] as const;

export const PERMISSION_CATALOG = [
  {
    key: "*",
    description: "Wildcard permission for all API capabilities.",
  },
  { key: "authorisation-model.read", description: "Read role and permission catalog definitions." },
  { key: "authorisation-model.update", description: "Update role to permission mappings." },
  { key: "functional-group.read", description: "Read functional group catalog records." },
  { key: "functional-group.create", description: "Create functional group catalog records." },
  { key: "functional-group.update", description: "Update functional group catalog records." },
  { key: "functional-group.disable", description: "Disable functional group catalog records." },
  { key: "access-grant.read", description: "Read access grants." },
  { key: "access-grant.create", description: "Create access grants." },
  { key: "access-grant.update", description: "Update access grants." },
  { key: "access-grant.disable", description: "Disable access grants." },
  { key: "audit.read", description: "Read access and policy audit history." },
  { key: "developer-tools.read", description: "Read developer-only diagnostics." },
  { key: "configurations.read", description: "Read configuration records." },
  { key: "configurations.write", description: "Create or update configuration records." },
  { key: "configurations.validate", description: "Validate source configuration connectivity." },
  { key: "configurations.delete", description: "Delete configuration records." },
  { key: "projects.read", description: "Read migration projects." },
  { key: "projects.write", description: "Create or update migration projects." },
  { key: "projects.delete", description: "Delete migration projects." },
  { key: "projects.assign", description: "Assign projects to users or workflows." },
  { key: "videos.read", description: "List and inspect source videos." },
] as const;

export type RevolutionPermission = (typeof PERMISSION_CATALOG)[number]["key"];
export type RevolutionRoleKey = (typeof ROLE_CATALOG)[number]["key"];

const nonWildcardPermissions = PERMISSION_CATALOG.map((entry) => entry.key).filter(
  (key) => key !== "*",
) as Exclude<RevolutionPermission, "*">[];

export const ROLE_PERMISSION_CATALOG: ReadonlyArray<{
  roleKey: RevolutionRoleKey;
  permissionKey: RevolutionPermission;
}> = [
  { roleKey: "REVOLUTION_PLATFORM_ADMINS", permissionKey: "*" },
  { roleKey: "REVOLUTION_OPERATORS", permissionKey: "authorisation-model.read" },
  { roleKey: "REVOLUTION_OPERATORS", permissionKey: "functional-group.read" },
  { roleKey: "REVOLUTION_OPERATORS", permissionKey: "access-grant.read" },
  { roleKey: "REVOLUTION_OPERATORS", permissionKey: "configurations.read" },
  { roleKey: "REVOLUTION_OPERATORS", permissionKey: "configurations.write" },
  { roleKey: "REVOLUTION_OPERATORS", permissionKey: "configurations.validate" },
  { roleKey: "REVOLUTION_OPERATORS", permissionKey: "projects.read" },
  { roleKey: "REVOLUTION_OPERATORS", permissionKey: "projects.write" },
  { roleKey: "REVOLUTION_OPERATORS", permissionKey: "projects.assign" },
  { roleKey: "REVOLUTION_OPERATORS", permissionKey: "videos.read" },
  { roleKey: "REVOLUTION_VIEWERS", permissionKey: "authorisation-model.read" },
  { roleKey: "REVOLUTION_VIEWERS", permissionKey: "functional-group.read" },
  { roleKey: "REVOLUTION_VIEWERS", permissionKey: "access-grant.read" },
  { roleKey: "REVOLUTION_VIEWERS", permissionKey: "configurations.read" },
  { roleKey: "REVOLUTION_VIEWERS", permissionKey: "projects.read" },
  { roleKey: "REVOLUTION_VIEWERS", permissionKey: "videos.read" },
];

const groupPermissions: Record<string, RevolutionPermission[]> = {
  REVOLUTION_PLATFORM_ADMINS: ["*"],
  REVOLUTION_OPERATORS: [
    "authorisation-model.read",
    "functional-group.read",
    "access-grant.read",
    "configurations.read",
    "configurations.write",
    "configurations.validate",
    "projects.read",
    "projects.write",
    "projects.assign",
    "videos.read",
  ],
  REVOLUTION_VIEWERS: [
    "authorisation-model.read",
    "functional-group.read",
    "access-grant.read",
    "configurations.read",
    "projects.read",
    "videos.read",
  ],
};

const permissionCategoryByKey: Record<RevolutionPermission, PermissionCatalogEntry["category"]> = {
  "*": "operational",
  "authorisation-model.read": "operational",
  "authorisation-model.update": "operational",
  "functional-group.read": "operational",
  "functional-group.create": "operational",
  "functional-group.update": "operational",
  "functional-group.disable": "operational",
  "access-grant.read": "operational",
  "access-grant.create": "operational",
  "access-grant.update": "operational",
  "access-grant.disable": "operational",
  "audit.read": "operational",
  "developer-tools.read": "developer",
  "configurations.read": "operational",
  "configurations.write": "operational",
  "configurations.validate": "operational",
  "configurations.delete": "operational",
  "projects.read": "operational",
  "projects.write": "operational",
  "projects.delete": "operational",
  "projects.assign": "operational",
  "videos.read": "operational",
};

const permissionScopeByKey: Record<RevolutionPermission, PermissionCatalogEntry["scope"]> = {
  "*": "global",
  "authorisation-model.read": "global",
  "authorisation-model.update": "global",
  "functional-group.read": "global",
  "functional-group.create": "global",
  "functional-group.update": "global",
  "functional-group.disable": "global",
  "access-grant.read": "global",
  "access-grant.create": "global",
  "access-grant.update": "global",
  "access-grant.disable": "global",
  "audit.read": "global",
  "developer-tools.read": "global",
  "configurations.read": "global",
  "configurations.write": "global",
  "configurations.validate": "global",
  "configurations.delete": "global",
  "projects.read": "global",
  "projects.write": "global",
  "projects.delete": "global",
  "projects.assign": "global",
  "videos.read": "global",
};

const toLabel = (value: string) =>
  value.replace(/[._-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export const roleCatalogDefaults: RoleCatalogEntry[] = ROLE_CATALOG.map((role) => ({
  key: role.key,
  label: toLabel(role.key),
  description: role.description,
  grantScope: "global",
  actorType: "human",
}));

export const permissionCatalogDefaults: PermissionCatalogEntry[] = PERMISSION_CATALOG.map(
  (permission) => ({
    key: permission.key,
    label: toLabel(permission.key),
    description: permission.description,
    category: permissionCategoryByKey[permission.key],
    scope: permissionScopeByKey[permission.key],
  }),
);

export const rolePermissionCatalogDefaults: RolePermissionCatalogEntry[] =
  ROLE_PERMISSION_CATALOG.map((entry) => ({
    roleKey: entry.roleKey,
    permissionKey: entry.permissionKey,
  }));

export const procedureCatalogDefaults: ProcedureDefinition[] = [
  { key: "meta.whoAmI", label: "Current identity", accessKind: "authenticated" },
  { key: "meta.session", label: "Session bootstrap", accessKind: "authenticated" },
  {
    key: "meta.authorisationModel",
    label: "Authorisation model",
    accessKind: "permission",
    permission: "authorisation-model.read",
  },
  {
    key: "access.functionalGroups.list",
    label: "List functional groups",
    accessKind: "permission",
    permission: "functional-group.read",
  },
  {
    key: "access.grants.list",
    label: "List access grants",
    accessKind: "permission",
    permission: "access-grant.read",
  },
  {
    key: "access.audit.list",
    label: "List access audit events",
    accessKind: "permission",
    permission: "audit.read",
  },
  {
    key: "access.effectiveAccess.bySubject",
    label: "View effective access by subject",
    accessKind: "permission",
    permission: "access-grant.read",
  },
  { key: "access.myAccess", label: "View my access", accessKind: "authenticated" },
  {
    key: "configurations.list",
    label: "List configurations",
    accessKind: "permission",
    permission: "configurations.read",
  },
  {
    key: "projects.list",
    label: "List projects",
    accessKind: "permission",
    permission: "projects.read",
  },
  {
    key: "videos.list",
    label: "List videos",
    accessKind: "permission",
    permission: "videos.read",
  },
];

export const getAllPermissionKeys = (): RevolutionPermission[] =>
  permissionCatalogDefaults.map((permission) => permission.key);

export const resolveGrants = (
  functionalGroups: string[],
  subject?: string,
): RevolutionPermission[] => {
  const grants = new Set<RevolutionPermission>();

  for (const group of functionalGroups) {
    for (const permission of groupPermissions[group] ?? []) {
      grants.add(permission);
    }
  }

  const bootstrapSuperAdminSubjects = (process.env.REVOLUTION_BOOTSTRAP_SUPER_ADMIN_SUBJECTS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (subject && bootstrapSuperAdminSubjects.includes(subject)) {
    grants.add("*");
  }

  if (grants.has("*")) {
    grants.delete("*");
    for (const permission of nonWildcardPermissions) {
      grants.add(permission);
    }
  }

  return Array.from(grants);
};

export const KNOWN_PERMISSION_KEYS = new Set<RevolutionPermission>(
  PERMISSION_CATALOG.map((entry) => entry.key),
);

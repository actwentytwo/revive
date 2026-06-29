import {
  getAuthorisationModel,
  getPermissionCatalogEntries,
  updateRolePermissions as updateRolePermissionsCatalog,
} from "./catalog.service.js";
import {
  appendAccessAuditEvent,
  createAccessGrant as createAccessGrantRecord,
  createFunctionalGroup as createFunctionalGroupRecord,
  deleteAccessGrant as deleteAccessGrantRecord,
  deleteFunctionalGroup as deleteFunctionalGroupRecord,
  disableAccessGrant as disableAccessGrantRecord,
  getAccessGrantById,
  getAccessGrantScopeKey,
  getFunctionalGroupByKey,
  listAccessAuditEvents as listAccessAuditEventRecords,
  listAccessGrants as listAccessGrantRecords,
  listEnabledAccessGrantsByFunctionalGroups,
  listFunctionalGroupCatalog,
  updateAccessGrant as updateAccessGrantRecord,
  updateFunctionalGroup as updateFunctionalGroupRecord,
  type AccessGrantRecord,
} from "./catalog.repository.js";
import type {
  AccessAuditEvent,
  AccessGrantCatalogEntry,
  AccessGrantSubjectType,
  CreateAccessGrantInput,
  CreateFunctionalGroupInput,
  DeleteAccessGrantInput,
  DeleteFunctionalGroupInput,
  DisableAccessGrantInput,
  EffectiveAccessSummary,
  FunctionalGroupCatalogRecord,
  ListAccessAuditEventsInput,
  UpdateAccessGrantInput,
  UpdateFunctionalGroupInput,
  UpdateRolePermissionsInput,
  UpdateRolePermissionsOutput,
} from "./catalog.schemas.js";

export class AccessManagementValidationError extends Error {}
export class AccessManagementNotFoundError extends Error {}
export class AccessManagementConflictError extends Error {}

const SYSTEM_ACTOR = "revolution-system";

const getBootstrapSuperAdminSubjects = () =>
  (process.env.REVOLUTION_BOOTSTRAP_SUPER_ADMIN_SUBJECTS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

const hasBootstrapSuperAdmin = (subject: string) =>
  getBootstrapSuperAdminSubjects().includes(subject);

const toAccessGrantCatalogEntry = (grant: AccessGrantRecord): AccessGrantCatalogEntry => ({
  grantId: grant.grantId,
  subjectType: grant.subjectType,
  subject: grant.subject,
  roleKey: grant.roleKey as AccessGrantCatalogEntry["roleKey"],
  scopeKey: grant.scopeKey,
  ...(grant.environmentKey ? { environmentKey: grant.environmentKey } : {}),
  ...(grant.clusterKey ? { clusterKey: grant.clusterKey } : {}),
  enabled: grant.enabled,
  createdAt: grant.createdAt,
  updatedAt: grant.updatedAt,
  createdBy: grant.createdBy,
  updatedBy: grant.updatedBy,
});

const getPermissionsForRole = async (roleKey: string) => {
  const permissionCatalog = getPermissionCatalogEntries().map((permission) => permission.key);
  const authorisationModel = await getAuthorisationModel();
  const role = authorisationModel.roles.find((entry) => entry.key === roleKey);

  if (!role) {
    return [] as typeof permissionCatalog;
  }

  if (role.permissions.includes("*")) {
    return permissionCatalog.filter((permission) => permission !== "*");
  }

  return role.permissions;
};

const collectPermissionsFromGrants = async (
  grants: AccessGrantCatalogEntry[],
): Promise<EffectiveAccessSummary["effectivePermissions"]> => {
  const permissionMap = new Map<
    EffectiveAccessSummary["effectivePermissions"][number]["permission"],
    EffectiveAccessSummary["effectivePermissions"][number]["reasons"]
  >();

  for (const grant of grants) {
    if (!grant.enabled) {
      continue;
    }

    const rolePermissions = await getPermissionsForRole(grant.roleKey);

    for (const permission of rolePermissions) {
      const reasons = permissionMap.get(permission) ?? [];
      reasons.push({
        grantId: grant.grantId,
        roleKey: grant.roleKey,
        scopeKey: getAccessGrantScopeKey(grant.environmentKey, grant.clusterKey),
        subjectType: grant.subjectType,
        subject: grant.subject,
        grantSource: "access-grant",
      });
      permissionMap.set(permission, reasons);
    }
  }

  return Array.from(permissionMap.entries())
    .map(([permission, reasons]) => ({ permission, reasons }))
    .sort((left, right) => left.permission.localeCompare(right.permission));
};

const appendBootstrapPermissions = async (
  permissions: EffectiveAccessSummary["effectivePermissions"],
  subject: string,
) => {
  const existing = new Map<
    EffectiveAccessSummary["effectivePermissions"][number]["permission"],
    EffectiveAccessSummary["effectivePermissions"][number]
  >(permissions.map((entry) => [entry.permission, entry]));

  const model = await getAuthorisationModel();
  const platformAdminRole = model.roles.find((role) => role.key === "REVOLUTION_PLATFORM_ADMINS");
  const bootstrapPermissions = platformAdminRole?.permissions ?? [];

  for (const permission of bootstrapPermissions) {
    if (permission === "*") {
      continue;
    }

    const current = existing.get(permission);
    const bootstrapReason = {
      grantId: "bootstrap-super-admin",
      roleKey: "REVOLUTION_PLATFORM_ADMINS" as const,
      scopeKey: "global",
      subjectType: "human" as const,
      subject,
      grantSource: "bootstrap" as const,
    };

    if (current) {
      if (!current.reasons.some((reason) => reason.grantId === bootstrapReason.grantId)) {
        current.reasons.push(bootstrapReason);
      }
    } else {
      existing.set(permission, { permission, reasons: [bootstrapReason] });
    }
  }

  return Array.from(existing.values()).sort((left, right) =>
    left.permission.localeCompare(right.permission),
  );
};

const buildSummary = async (
  subjectType: AccessGrantSubjectType,
  subject: string,
  functionalGroups: string[],
): Promise<EffectiveAccessSummary> => {
  const [directGrantRecords, groupGrantRecords] = await Promise.all([
    listAccessGrantRecords({ includeDisabled: false, subjectType, subject }),
    listEnabledAccessGrantsByFunctionalGroups(functionalGroups),
  ]);

  const grants = [
    ...directGrantRecords.map(toAccessGrantCatalogEntry),
    ...groupGrantRecords.map(toAccessGrantCatalogEntry),
  ];

  const dedupedGrants = Array.from(new Map(grants.map((grant) => [grant.grantId, grant])).values());

  const bootstrap = subjectType === "human" && hasBootstrapSuperAdmin(subject);
  const calculatedPermissions = await collectPermissionsFromGrants(dedupedGrants);
  const effectivePermissions = bootstrap
    ? await appendBootstrapPermissions(calculatedPermissions, subject)
    : calculatedPermissions;

  return {
    subjectType,
    subject,
    functionalGroups,
    hasBootstrapSuperAdmin: bootstrap,
    grants: dedupedGrants,
    effectivePermissions,
  };
};

export const getAccessAuthorisationModel = () => getAuthorisationModel();

export const updateRolePermissions = async (
  input: UpdateRolePermissionsInput,
  actor: string,
): Promise<UpdateRolePermissionsOutput> => {
  const result = await updateRolePermissionsCatalog(input);

  await appendAccessAuditEvent({
    action: "access.role-permissions.updated",
    actor,
    targetType: "role-permission",
    targetKey: input.roleKey,
    details: {
      permissionCount: input.permissionKeys.length,
      permissionKeys: input.permissionKeys,
    },
  });

  return result;
};

export const listFunctionalGroups = async ({
  includeDisabled,
}: {
  includeDisabled?: boolean;
} = {}): Promise<FunctionalGroupCatalogRecord[]> => listFunctionalGroupCatalog({ includeDisabled });

export const createFunctionalGroup = async (
  input: CreateFunctionalGroupInput,
  actor: string,
): Promise<FunctionalGroupCatalogRecord> => {
  const existing = await getFunctionalGroupByKey(input.key);
  if (existing) {
    throw new AccessManagementConflictError(`Functional group ${input.key} already exists.`);
  }

  const created = await createFunctionalGroupRecord({
    key: input.key,
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    enabled: input.enabled ?? true,
    actor,
  });

  await appendAccessAuditEvent({
    action: "access.functional-group.created",
    actor,
    targetType: "functional-group",
    targetKey: input.key,
    details: { name: input.name, enabled: input.enabled ?? true },
  });

  return created;
};

export const updateFunctionalGroup = async (
  input: UpdateFunctionalGroupInput,
  actor: string,
): Promise<FunctionalGroupCatalogRecord> => {
  const existing = await getFunctionalGroupByKey(input.key);
  if (!existing) {
    throw new AccessManagementNotFoundError(`Functional group ${input.key} was not found.`);
  }

  const updated = await updateFunctionalGroupRecord({ ...input, actor });
  if (!updated) {
    throw new AccessManagementNotFoundError(`Functional group ${input.key} was not found.`);
  }

  await appendAccessAuditEvent({
    action: "access.functional-group.updated",
    actor,
    targetType: "functional-group",
    targetKey: input.key,
    details: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
    },
  });

  return updated;
};

export const deleteFunctionalGroup = async (
  input: DeleteFunctionalGroupInput,
  actor: string,
): Promise<{ key: string }> => {
  const removed = await deleteFunctionalGroupRecord(input.key);
  if (!removed) {
    throw new AccessManagementNotFoundError(`Functional group ${input.key} was not found.`);
  }

  await appendAccessAuditEvent({
    action: "access.functional-group.deleted",
    actor,
    targetType: "functional-group",
    targetKey: input.key,
  });

  return { key: input.key };
};

export const listAccessGrants = async ({
  includeDisabled,
}: {
  includeDisabled?: boolean;
} = {}): Promise<AccessGrantCatalogEntry[]> => {
  const grants = await listAccessGrantRecords({ includeDisabled });
  return grants.map(toAccessGrantCatalogEntry);
};

export const createAccessGrant = async (
  input: CreateAccessGrantInput,
  actor: string,
): Promise<AccessGrantCatalogEntry> => {
  const created = await createAccessGrantRecord({
    subjectType: input.subjectType,
    subject: input.subject,
    roleKey: input.roleKey,
    environmentKey: input.environmentKey,
    clusterKey: input.clusterKey,
    enabled: input.enabled ?? true,
    actor,
  });

  await appendAccessAuditEvent({
    action: "access.grant.created",
    actor,
    targetType: "access-grant",
    targetKey: created.grantId,
    details: {
      subjectType: created.subjectType,
      subject: created.subject,
      roleKey: created.roleKey,
      scopeKey: created.scopeKey,
    },
  });

  return toAccessGrantCatalogEntry(created);
};

export const updateAccessGrant = async (
  input: UpdateAccessGrantInput,
  actor: string,
): Promise<AccessGrantCatalogEntry> => {
  const updated = await updateAccessGrantRecord({ ...input, actor });

  if (!updated) {
    throw new AccessManagementNotFoundError(`Access grant ${input.grantId} was not found.`);
  }

  await appendAccessAuditEvent({
    action: "access.grant.updated",
    actor,
    targetType: "access-grant",
    targetKey: input.grantId,
    details: {
      ...(input.roleKey !== undefined ? { roleKey: input.roleKey } : {}),
      ...(input.environmentKey !== undefined ? { environmentKey: input.environmentKey } : {}),
      ...(input.clusterKey !== undefined ? { clusterKey: input.clusterKey } : {}),
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
    },
  });

  return toAccessGrantCatalogEntry(updated);
};

export const disableAccessGrant = async (
  input: DisableAccessGrantInput,
  actor: string,
): Promise<AccessGrantCatalogEntry> => {
  const updated = await disableAccessGrantRecord(input.grantId, actor);

  if (!updated) {
    throw new AccessManagementNotFoundError(`Access grant ${input.grantId} was not found.`);
  }

  await appendAccessAuditEvent({
    action: "access.grant.disabled",
    actor,
    targetType: "access-grant",
    targetKey: input.grantId,
  });

  return toAccessGrantCatalogEntry(updated);
};

export const deleteAccessGrant = async (
  input: DeleteAccessGrantInput,
  actor: string,
): Promise<AccessGrantCatalogEntry> => {
  const existing = await getAccessGrantById(input.grantId);
  if (!existing) {
    throw new AccessManagementNotFoundError(`Access grant ${input.grantId} was not found.`);
  }

  await deleteAccessGrantRecord(input.grantId);

  await appendAccessAuditEvent({
    action: "access.grant.deleted",
    actor,
    targetType: "access-grant",
    targetKey: input.grantId,
  });

  return toAccessGrantCatalogEntry(existing);
};

export const listAccessAuditEvents = async (
  { limit }: ListAccessAuditEventsInput = { limit: 100 },
): Promise<AccessAuditEvent[]> => {
  const events = await listAccessAuditEventRecords({ limit: limit ?? 100 });

  if (events.length > 0) {
    return events;
  }

  await appendAccessAuditEvent({
    action: "access.catalog.seeded",
    actor: SYSTEM_ACTOR,
    targetType: "role-permission",
    targetKey: "role-permission-catalog",
    details: {
      roleCount: (await getAuthorisationModel()).roles.length,
      permissionCount: getPermissionCatalogEntries().length,
    },
  });

  return listAccessAuditEventRecords({ limit: limit ?? 100 });
};

export const getEffectiveAccessBySubject = async (
  subjectType: AccessGrantSubjectType,
  subject: string,
  options?: {
    callerSubject?: string;
    callerFunctionalGroups?: string[];
  },
): Promise<EffectiveAccessSummary> => {
  const requestedSubject = subject.trim();
  const callerSubject = options?.callerSubject?.trim();
  const callerFunctionalGroups = options?.callerFunctionalGroups ?? [];

  const devBypassSubject = (process.env.DEV_LOCALHOST_BYPASS_SUBJECT ?? "").trim();
  const devBypassGroups = (process.env.DEV_LOCALHOST_BYPASS_FUNCTIONAL_GROUPS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const functionalGroups =
    subjectType === "functional-group"
      ? [requestedSubject]
      : callerSubject && callerSubject === requestedSubject
        ? callerFunctionalGroups
        : devBypassSubject && devBypassSubject === requestedSubject
          ? devBypassGroups
          : [];

  return buildSummary(subjectType, requestedSubject, functionalGroups);
};

export const getMyAccess = async (
  subjectType: "human" | "workload",
  subject: string,
  enabledFunctionalGroups: string[],
): Promise<EffectiveAccessSummary> => buildSummary(subjectType, subject, enabledFunctionalGroups);

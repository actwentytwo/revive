import { randomUUID } from "node:crypto";
import type { Db } from "mongodb";
import { getMongoDb } from "../db/mongo.js";
import {
  KNOWN_PERMISSION_KEYS,
  PERMISSION_CATALOG,
  ROLE_CATALOG,
  ROLE_PERMISSION_CATALOG,
  type RevolutionPermission,
  resolveGrants as resolveGrantsFallback,
} from "./catalog.defaults.js";

type RoleCatalogRecord = {
  key: string;
  description: string;
  updatedAt: Date;
};

type PermissionCatalogRecord = {
  key: string;
  description: string;
  updatedAt: Date;
};

type RolePermissionCatalogRecord = {
  roleKey: string;
  permissionKey: string;
  updatedAt: Date;
};

export type FunctionalGroupCatalogRecord = {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

export type AccessGrantRecord = {
  grantId: string;
  subjectType: "human" | "functional-group" | "workload";
  subject: string;
  roleKey: string;
  scopeKey: string;
  environmentKey?: string;
  clusterKey?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

export type AccessAuditEventRecord = {
  id: string;
  action: string;
  actor: string;
  targetType: "functional-group" | "access-grant" | "role-permission";
  targetKey: string;
  createdAt: string;
  details?: Record<string, unknown>;
};

const ROLE_CATALOG_COLLECTION = "role-catalog";
const PERMISSION_CATALOG_COLLECTION = "permission-catalog";
const ROLE_PERMISSION_CATALOG_COLLECTION = "role-permission-catalog";
const FUNCTIONAL_GROUP_CATALOG_COLLECTION = "functional-group-catalog";
const ACCESS_GRANTS_COLLECTION = "access-grants";
const ACCESS_AUDIT_EVENTS_COLLECTION = "access-audit-events";

const CATALOG_CACHE_TTL_MS = 60_000;
const SYSTEM_ACTOR = "revolution-system";
const nonWildcardPermissions = PERMISSION_CATALOG.map((entry) => entry.key).filter(
  (key) => key !== "*",
) as Exclude<RevolutionPermission, "*">[];

let rolePermissionCache: {
  expiresAt: number;
  map: Map<string, RevolutionPermission[]>;
} | null = null;

const toScopeKey = (environmentKey?: string, clusterKey?: string): string => {
  if (!environmentKey) {
    return "global";
  }

  return clusterKey
    ? `environment:${environmentKey}:cluster:${clusterKey}`
    : `environment:${environmentKey}`;
};

const toFunctionalGroupName = (key: string): string =>
  key
    .split(/[._-]/g)
    .filter(Boolean)
    .map((segment) => `${segment.slice(0, 1).toUpperCase()}${segment.slice(1).toLowerCase()}`)
    .join(" ");

export async function initializeAccessCatalogs(): Promise<void> {
  const db = await getMongoDb();
  const now = new Date();
  const nowIso = now.toISOString();

  await ensureIndexes(db);

  await db.collection<RoleCatalogRecord>(ROLE_CATALOG_COLLECTION).bulkWrite(
    ROLE_CATALOG.map((role) => ({
      updateOne: {
        filter: { key: role.key },
        update: { $set: { key: role.key, description: role.description, updatedAt: now } },
        upsert: true,
      },
    })),
  );

  await db.collection<PermissionCatalogRecord>(PERMISSION_CATALOG_COLLECTION).bulkWrite(
    PERMISSION_CATALOG.map((permission) => ({
      updateOne: {
        filter: { key: permission.key },
        update: {
          $set: {
            key: permission.key,
            description: permission.description,
            updatedAt: now,
          },
        },
        upsert: true,
      },
    })),
  );

  await db.collection<RolePermissionCatalogRecord>(ROLE_PERMISSION_CATALOG_COLLECTION).bulkWrite(
    ROLE_PERMISSION_CATALOG.map((entry) => ({
      updateOne: {
        filter: { roleKey: entry.roleKey, permissionKey: entry.permissionKey },
        update: {
          $set: {
            roleKey: entry.roleKey,
            permissionKey: entry.permissionKey,
            updatedAt: now,
          },
        },
        upsert: true,
      },
    })),
  );

  await db.collection<FunctionalGroupCatalogRecord>(FUNCTIONAL_GROUP_CATALOG_COLLECTION).bulkWrite(
    ROLE_CATALOG.map((role) => ({
      updateOne: {
        filter: { key: role.key },
        update: {
          $setOnInsert: {
            key: role.key,
            name: toFunctionalGroupName(role.key),
            description: role.description,
            enabled: true,
            createdAt: nowIso,
            createdBy: SYSTEM_ACTOR,
          },
          $set: {
            updatedAt: nowIso,
            updatedBy: SYSTEM_ACTOR,
          },
        },
        upsert: true,
      },
    })),
  );

  await db.collection<AccessGrantRecord>(ACCESS_GRANTS_COLLECTION).bulkWrite(
    ROLE_CATALOG.map((role) => ({
      updateOne: {
        filter: {
          subjectType: "functional-group",
          subject: role.key,
          roleKey: role.key,
          scopeKey: "global",
        },
        update: {
          $setOnInsert: {
            grantId: randomUUID(),
            subjectType: "functional-group",
            subject: role.key,
            roleKey: role.key,
            scopeKey: "global",
            enabled: true,
            createdAt: nowIso,
            createdBy: SYSTEM_ACTOR,
          },
          $set: {
            updatedAt: nowIso,
            updatedBy: SYSTEM_ACTOR,
          },
        },
        upsert: true,
      },
    })),
  );

  rolePermissionCache = null;
}

async function ensureIndexes(db: Db): Promise<void> {
  await db
    .collection<RoleCatalogRecord>(ROLE_CATALOG_COLLECTION)
    .createIndexes([{ key: { key: 1 }, name: "role-catalog-key-unique", unique: true }]);

  await db
    .collection<PermissionCatalogRecord>(PERMISSION_CATALOG_COLLECTION)
    .createIndexes([{ key: { key: 1 }, name: "permission-catalog-key-unique", unique: true }]);

  await db
    .collection<RolePermissionCatalogRecord>(ROLE_PERMISSION_CATALOG_COLLECTION)
    .createIndexes([
      {
        key: { roleKey: 1, permissionKey: 1 },
        name: "role-permission-catalog-unique",
        unique: true,
      },
    ]);

  await db
    .collection<FunctionalGroupCatalogRecord>(FUNCTIONAL_GROUP_CATALOG_COLLECTION)
    .createIndexes([
      { key: { key: 1 }, name: "functional-group-catalog-key-unique", unique: true },
      { key: { enabled: 1 }, name: "functional-group-catalog-enabled" },
    ]);

  await db.collection<AccessGrantRecord>(ACCESS_GRANTS_COLLECTION).createIndexes([
    { key: { grantId: 1 }, name: "access-grants-id-unique", unique: true },
    {
      key: { subjectType: 1, subject: 1, roleKey: 1, scopeKey: 1 },
      name: "access-grants-subject-role-scope-unique",
      unique: true,
    },
    { key: { enabled: 1, subjectType: 1, subject: 1 }, name: "access-grants-subject-enabled" },
  ]);

  await db.collection<AccessAuditEventRecord>(ACCESS_AUDIT_EVENTS_COLLECTION).createIndexes([
    { key: { id: 1 }, name: "access-audit-events-id-unique", unique: true },
    { key: { createdAt: -1 }, name: "access-audit-events-created-at-desc" },
  ]);
}

export async function resolveGrantsFromCatalog(
  functionalGroups: string[],
  subject?: string,
): Promise<RevolutionPermission[]> {
  try {
    const rolePermissionMap = await loadRolePermissionMap();
    const grants = new Set<RevolutionPermission>();

    for (const group of functionalGroups) {
      for (const permission of rolePermissionMap.get(group) ?? []) {
        grants.add(permission);
      }
    }

    if (subject && isBootstrapSuperAdmin(subject)) {
      grants.add("*");
    }

    if (grants.has("*")) {
      grants.delete("*");
      for (const permission of nonWildcardPermissions) {
        grants.add(permission);
      }
    }

    return Array.from(grants);
  } catch {
    return resolveGrantsFallback(functionalGroups, subject);
  }
}

export async function listRolePermissionCatalogEntries(): Promise<
  Array<{ roleKey: string; permissionKey: RevolutionPermission }>
> {
  try {
    const map = await loadRolePermissionMap();
    const entries: Array<{ roleKey: string; permissionKey: RevolutionPermission }> = [];

    for (const [roleKey, permissions] of map.entries()) {
      for (const permissionKey of permissions) {
        entries.push({ roleKey, permissionKey });
      }
    }

    if (entries.length > 0) {
      return entries;
    }
  } catch {
    // Fall back to defaults below.
  }

  return ROLE_PERMISSION_CATALOG.map((entry) => ({
    roleKey: entry.roleKey,
    permissionKey: entry.permissionKey,
  }));
}

export async function setRolePermissionsForRole(
  roleKey: string,
  permissionKeys: RevolutionPermission[],
): Promise<void> {
  const db = await getMongoDb();
  const now = new Date();
  const collection = db.collection<RolePermissionCatalogRecord>(ROLE_PERMISSION_CATALOG_COLLECTION);

  await collection.deleteMany({ roleKey });

  if (permissionKeys.length > 0) {
    await collection.insertMany(
      permissionKeys.map((permissionKey) => ({
        roleKey,
        permissionKey,
        updatedAt: now,
      })),
    );
  }

  rolePermissionCache = null;
}

export async function listFunctionalGroupCatalog({
  includeDisabled = false,
}: {
  includeDisabled?: boolean;
} = {}): Promise<FunctionalGroupCatalogRecord[]> {
  const db = await getMongoDb();

  return db
    .collection<FunctionalGroupCatalogRecord>(FUNCTIONAL_GROUP_CATALOG_COLLECTION)
    .find(includeDisabled ? {} : { enabled: true })
    .sort({ key: 1 })
    .toArray();
}

export async function getFunctionalGroupByKey(
  key: string,
): Promise<FunctionalGroupCatalogRecord | null> {
  const db = await getMongoDb();

  return db
    .collection<FunctionalGroupCatalogRecord>(FUNCTIONAL_GROUP_CATALOG_COLLECTION)
    .findOne({ key });
}

export async function createFunctionalGroup(input: {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  actor: string;
}): Promise<FunctionalGroupCatalogRecord> {
  const db = await getMongoDb();
  const nowIso = new Date().toISOString();
  const record: FunctionalGroupCatalogRecord = {
    key: input.key,
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    enabled: input.enabled,
    createdAt: nowIso,
    updatedAt: nowIso,
    createdBy: input.actor,
    updatedBy: input.actor,
  };

  await db
    .collection<FunctionalGroupCatalogRecord>(FUNCTIONAL_GROUP_CATALOG_COLLECTION)
    .insertOne(record);

  return record;
}

export async function updateFunctionalGroup(input: {
  key: string;
  name?: string;
  description?: string;
  enabled?: boolean;
  actor: string;
}): Promise<FunctionalGroupCatalogRecord | null> {
  const db = await getMongoDb();
  const nowIso = new Date().toISOString();

  await db.collection<FunctionalGroupCatalogRecord>(FUNCTIONAL_GROUP_CATALOG_COLLECTION).updateOne(
    { key: input.key },
    {
      $set: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
        updatedAt: nowIso,
        updatedBy: input.actor,
      },
    },
  );

  return getFunctionalGroupByKey(input.key);
}

export async function deleteFunctionalGroup(key: string): Promise<boolean> {
  const db = await getMongoDb();
  const result = await db
    .collection<FunctionalGroupCatalogRecord>(FUNCTIONAL_GROUP_CATALOG_COLLECTION)
    .deleteOne({ key });

  return result.deletedCount > 0;
}

export async function listAccessGrants({
  includeDisabled = false,
  subjectType,
  subject,
}: {
  includeDisabled?: boolean;
  subjectType?: AccessGrantRecord["subjectType"];
  subject?: string;
} = {}): Promise<AccessGrantRecord[]> {
  const db = await getMongoDb();

  return db
    .collection<AccessGrantRecord>(ACCESS_GRANTS_COLLECTION)
    .find({
      ...(includeDisabled ? {} : { enabled: true }),
      ...(subjectType ? { subjectType } : {}),
      ...(subject ? { subject } : {}),
    })
    .sort({ createdAt: -1, grantId: 1 })
    .toArray();
}

export async function getAccessGrantById(grantId: string): Promise<AccessGrantRecord | null> {
  const db = await getMongoDb();
  return db.collection<AccessGrantRecord>(ACCESS_GRANTS_COLLECTION).findOne({ grantId });
}

export async function createAccessGrant(input: {
  subjectType: AccessGrantRecord["subjectType"];
  subject: string;
  roleKey: string;
  environmentKey?: string;
  clusterKey?: string;
  enabled: boolean;
  actor: string;
}): Promise<AccessGrantRecord> {
  const db = await getMongoDb();
  const nowIso = new Date().toISOString();

  const record: AccessGrantRecord = {
    grantId: randomUUID(),
    subjectType: input.subjectType,
    subject: input.subject,
    roleKey: input.roleKey,
    scopeKey: toScopeKey(input.environmentKey, input.clusterKey),
    ...(input.environmentKey ? { environmentKey: input.environmentKey } : {}),
    ...(input.clusterKey ? { clusterKey: input.clusterKey } : {}),
    enabled: input.enabled,
    createdAt: nowIso,
    updatedAt: nowIso,
    createdBy: input.actor,
    updatedBy: input.actor,
  };

  await db.collection<AccessGrantRecord>(ACCESS_GRANTS_COLLECTION).insertOne(record);

  return record;
}

export async function updateAccessGrant(input: {
  grantId: string;
  roleKey?: string;
  environmentKey?: string;
  clusterKey?: string;
  enabled?: boolean;
  actor: string;
}): Promise<AccessGrantRecord | null> {
  const db = await getMongoDb();
  const existing = await getAccessGrantById(input.grantId);
  if (!existing) {
    return null;
  }

  const nextEnvironmentKey =
    input.environmentKey !== undefined ? input.environmentKey : existing.environmentKey;
  const nextClusterKey = input.clusterKey !== undefined ? input.clusterKey : existing.clusterKey;
  const nowIso = new Date().toISOString();

  await db.collection<AccessGrantRecord>(ACCESS_GRANTS_COLLECTION).updateOne(
    { grantId: input.grantId },
    {
      $set: {
        ...(input.roleKey ? { roleKey: input.roleKey } : {}),
        ...(input.environmentKey !== undefined ? { environmentKey: input.environmentKey } : {}),
        ...(input.clusterKey !== undefined ? { clusterKey: input.clusterKey } : {}),
        ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
        scopeKey: toScopeKey(nextEnvironmentKey, nextClusterKey),
        updatedAt: nowIso,
        updatedBy: input.actor,
      },
    },
  );

  return getAccessGrantById(input.grantId);
}

export async function disableAccessGrant(
  grantId: string,
  actor: string,
): Promise<AccessGrantRecord | null> {
  return updateAccessGrant({ grantId, enabled: false, actor });
}

export async function deleteAccessGrant(grantId: string): Promise<boolean> {
  const db = await getMongoDb();
  const result = await db.collection<AccessGrantRecord>(ACCESS_GRANTS_COLLECTION).deleteOne({
    grantId,
  });

  return result.deletedCount > 0;
}

export async function listEnabledAccessGrantsByFunctionalGroups(
  functionalGroups: string[],
): Promise<AccessGrantRecord[]> {
  if (functionalGroups.length === 0) {
    return [];
  }

  const db = await getMongoDb();

  return db
    .collection<AccessGrantRecord>(ACCESS_GRANTS_COLLECTION)
    .find({
      enabled: true,
      subjectType: "functional-group",
      subject: { $in: functionalGroups },
    })
    .sort({ createdAt: -1, grantId: 1 })
    .toArray();
}

export async function appendAccessAuditEvent(
  event: Omit<AccessAuditEventRecord, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
  },
): Promise<void> {
  const db = await getMongoDb();
  const nowIso = new Date().toISOString();

  await db.collection<AccessAuditEventRecord>(ACCESS_AUDIT_EVENTS_COLLECTION).insertOne({
    id: event.id ?? randomUUID(),
    action: event.action,
    actor: event.actor,
    targetType: event.targetType,
    targetKey: event.targetKey,
    createdAt: event.createdAt ?? nowIso,
    ...(event.details ? { details: event.details } : {}),
  });
}

export async function listAccessAuditEvents({
  limit = 100,
}: {
  limit?: number;
} = {}): Promise<AccessAuditEventRecord[]> {
  const db = await getMongoDb();

  return db
    .collection<AccessAuditEventRecord>(ACCESS_AUDIT_EVENTS_COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

async function loadRolePermissionMap(): Promise<Map<string, RevolutionPermission[]>> {
  const now = Date.now();
  if (rolePermissionCache && rolePermissionCache.expiresAt > now) {
    return rolePermissionCache.map;
  }

  const db = await getMongoDb();
  const records = await db
    .collection<RolePermissionCatalogRecord>(ROLE_PERMISSION_CATALOG_COLLECTION)
    .find({})
    .toArray();

  const map = new Map<string, RevolutionPermission[]>();
  for (const record of records) {
    if (!KNOWN_PERMISSION_KEYS.has(record.permissionKey as RevolutionPermission)) {
      continue;
    }

    const existing = map.get(record.roleKey);
    if (existing) {
      existing.push(record.permissionKey as RevolutionPermission);
    } else {
      map.set(record.roleKey, [record.permissionKey as RevolutionPermission]);
    }
  }

  rolePermissionCache = { expiresAt: now + CATALOG_CACHE_TTL_MS, map };
  return map;
}

function isBootstrapSuperAdmin(subject: string): boolean {
  const configured = (process.env.REVOLUTION_BOOTSTRAP_SUPER_ADMIN_SUBJECTS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return configured.includes(subject);
}

export const getAccessGrantScopeKey = toScopeKey;

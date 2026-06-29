export type AccessGrantSubjectType = "human" | "functional-group" | "workload";

export type AccessGrantReason = {
  grantId: string;
  roleKey: string;
  scopeKey: string;
  subjectType: AccessGrantSubjectType;
  subject: string;
  grantSource: "access-grant" | "bootstrap";
};

export type AccessGrantRecord = {
  grantId: string;
  subjectType: AccessGrantSubjectType;
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

export type FunctionalGroupRecord = {
  key: string;
  name: string;
  description?: string;
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

export type MyAccessSummary = {
  subjectType: "human" | "functional-group" | "workload";
  subject: string;
  functionalGroups: string[];
  hasBootstrapSuperAdmin: boolean;
  grants: AccessGrantRecord[];
  effectivePermissions: Array<{ permission: string; reasons: AccessGrantReason[] }>;
};

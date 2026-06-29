export type SessionResponse = {
  actorType: "human" | "workload" | null;
  identity: {
    subject: string;
    issuer?: string;
    sid?: string;
    cn?: string;
    emailAddress?: string;
  } | null;
  functionalGroups: string[];
  grants: string[];
  requestId: string;
};

export type AuthorisationModelResponse = {
  roles: Array<{
    key: string;
    label: string;
    description: string;
    grantScope: "global" | "environment" | "environment-cluster";
    actorType: "human" | "workload" | "any";
    permissions: string[];
  }>;
  permissions: Array<{
    key: string;
    label: string;
    description: string;
    category: "operational" | "developer";
    scope: "global" | "environment" | "environment-cluster";
  }>;
  procedures: Array<{
    key: string;
    label: string;
    accessKind: "public" | "authenticated" | "permission";
    permission?: string;
  }>;
};

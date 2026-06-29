export type RevolutionPermission =
  | "*"
  | "configurations.read"
  | "configurations.write"
  | "configurations.validate"
  | "configurations.delete"
  | "projects.read"
  | "projects.write"
  | "projects.delete"
  | "projects.assign"
  | "videos.read";

const groupPermissions: Record<string, RevolutionPermission[]> = {
  REVOLUTION_PLATFORM_ADMINS: ["*"],
  REVOLUTION_OPERATORS: [
    "configurations.read",
    "configurations.write",
    "configurations.validate",
    "projects.read",
    "projects.write",
    "projects.assign",
    "videos.read",
  ],
  REVOLUTION_VIEWERS: ["configurations.read", "projects.read", "videos.read"],
};

const bootstrapSuperAdminSubjects = (process.env.REVOLUTION_BOOTSTRAP_SUPER_ADMIN_SUBJECTS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

export function resolveGrants(
  functionalGroups: string[],
  subject?: string,
): RevolutionPermission[] {
  const grants = new Set<RevolutionPermission>();

  for (const group of functionalGroups) {
    for (const permission of groupPermissions[group] ?? []) {
      grants.add(permission);
    }
  }

  if (subject && bootstrapSuperAdminSubjects.includes(subject)) {
    grants.add("*");
  }

  return Array.from(grants);
}

import type { RevolutionIdentity } from "./identity.js";

const humanSubjectOus = (process.env.REVOLUTION_HUMAN_SUBJECT_OUS ?? "users")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const workloadSubjectOus = (process.env.REVOLUTION_WORKLOAD_SUBJECT_OUS ?? "computers")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

function extractSubjectOus(subject: string): string[] {
  return subject
    .split(",")
    .map((segment) => segment.trim())
    .filter((segment) => /^OU=/i.test(segment))
    .map((segment) => segment.slice(3).trim().toLowerCase());
}

export function resolveActorType(identity: RevolutionIdentity | null): "human" | "workload" | null {
  if (!identity) {
    return null;
  }

  const subjectOus = extractSubjectOus(identity.subject);

  if (subjectOus.some((value) => humanSubjectOus.includes(value))) {
    return "human";
  }

  if (subjectOus.some((value) => workloadSubjectOus.includes(value))) {
    return "workload";
  }

  return null;
}

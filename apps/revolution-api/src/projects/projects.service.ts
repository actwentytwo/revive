import type { MigrationProject } from "@revolution/shared";
import {
  ensureConfigurationsBootstrapped,
  createConfiguration,
} from "../configurations/configurations.service.js";
import { MongoProjectsRepository } from "./projects.repository.js";
import type {
  AssignProjectConfigurationsInput,
  CreateProjectInput,
  MigrationProjectRecord,
  UpdateProjectInput,
} from "./projects.schemas.js";

const SYSTEM_ACTOR = "system";

const projectsRepository = new MongoProjectsRepository();

let bootstrapPromise: Promise<void> | null = null;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toProject(record: MigrationProjectRecord): MigrationProject {
  return {
    id: record.id,
    slug: record.slug ?? (slugify(record.name) || record.id),
    name: record.name,
    projectType: record.projectType ?? "migration",
    summary: record.summary,
    sourceConfigurationId: record.sourceConfigurationId ?? null,
    destinationConfigurationId: record.destinationConfigurationId ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

async function migrateLegacyProjectConfigurations() {
  const projects = await projectsRepository.findAll();

  for (const project of projects) {
    let updatedProject = project;
    let changed = false;

    if (!updatedProject.sourceConfigurationId && updatedProject.sourceEnvironment) {
      const configuration = await createConfiguration({
        name: `${updatedProject.name} Source`,
        productVersion: updatedProject.sourceValidatedEnvironment?.revVersion ?? "",
        environment: updatedProject.sourceEnvironment,
      });

      updatedProject = {
        ...updatedProject,
        sourceConfigurationId: configuration.id,
        updatedAt: new Date().toISOString(),
        updatedBy: SYSTEM_ACTOR,
      };
      changed = true;
    }

    if (!updatedProject.destinationConfigurationId && updatedProject.destinationEnvironment) {
      const configuration = await createConfiguration({
        name: `${updatedProject.name} Destination`,
        productVersion: updatedProject.destinationValidatedEnvironment?.revVersion ?? "",
        environment: updatedProject.destinationEnvironment,
      });

      updatedProject = {
        ...updatedProject,
        destinationConfigurationId: configuration.id,
        updatedAt: new Date().toISOString(),
        updatedBy: SYSTEM_ACTOR,
      };
      changed = true;
    }

    if (changed) {
      await projectsRepository.replace(updatedProject);
    }
  }
}

async function migrateLegacyProjectSlugs() {
  const projects = await projectsRepository.findAll();
  const usedSlugs = new Set<string>();

  for (const project of projects) {
    const baseSlug = slugify(project.slug ?? project.name ?? project.id) || "project";
    let candidateSlug = baseSlug;
    let suffix = 2;

    while (usedSlugs.has(candidateSlug)) {
      candidateSlug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    usedSlugs.add(candidateSlug);

    if (project.slug === candidateSlug) {
      continue;
    }

    await projectsRepository.replace({
      ...project,
      slug: candidateSlug,
      updatedAt: new Date().toISOString(),
      updatedBy: SYSTEM_ACTOR,
    });
  }
}

async function removeLegacyDefaultProjectIfPresent() {
  const legacyDefaultProject = await projectsRepository.findById("default");

  if (!legacyDefaultProject) {
    return;
  }

  await projectsRepository.deleteById("default");
}

export async function ensureProjectsBootstrapped() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await ensureConfigurationsBootstrapped();
      await migrateLegacyProjectConfigurations();
      await migrateLegacyProjectSlugs();
      await removeLegacyDefaultProjectIfPresent();
      await projectsRepository.ensureIndexes();
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  await bootstrapPromise;
}

async function getProjectRecordOrThrow(projectId: string) {
  await ensureProjectsBootstrapped();
  const project = await projectsRepository.findById(projectId);

  if (!project) {
    throw new Error(`Project '${projectId}' was not found.`);
  }

  return project;
}

export async function getProjectRecordById(projectId: string) {
  return getProjectRecordOrThrow(projectId);
}

async function generateProjectId(name: string) {
  const baseId = slugify(name) || "project";
  let candidateId = baseId;
  let suffix = 2;

  while (await projectsRepository.findById(candidateId)) {
    candidateId = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return candidateId;
}

async function generateUniqueProjectSlug(value: string, projectId?: string) {
  const baseSlug = slugify(value) || "project";
  let candidateSlug = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await projectsRepository.findBySlug(candidateSlug);

    if (!existing || existing.id === projectId) {
      return candidateSlug;
    }

    candidateSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function listProjects() {
  await ensureProjectsBootstrapped();
  const projects = await projectsRepository.findAll();
  return projects.map(toProject);
}

export async function createProject(input: CreateProjectInput) {
  await ensureProjectsBootstrapped();

  const timestamp = new Date().toISOString();
  const slugSource = input.slug?.trim() || input.name.trim();
  const record: MigrationProjectRecord = {
    id: await generateProjectId(input.name),
    slug: await generateUniqueProjectSlug(slugSource),
    name: input.name.trim(),
    projectType: input.projectType,
    summary: input.summary.trim(),
    sourceConfigurationId: null,
    destinationConfigurationId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: SYSTEM_ACTOR,
    updatedBy: SYSTEM_ACTOR,
  };

  await projectsRepository.create(record);
  return toProject(record);
}

export async function updateProject(input: UpdateProjectInput) {
  const project = await getProjectRecordOrThrow(input.projectId);
  const nextSlug = input.slug?.trim();

  const updatedProject: MigrationProjectRecord = {
    ...project,
    slug: nextSlug ? await generateUniqueProjectSlug(nextSlug, project.id) : project.slug,
    name: input.name.trim(),
    summary: input.summary.trim(),
    updatedAt: new Date().toISOString(),
    updatedBy: SYSTEM_ACTOR,
  };

  await projectsRepository.replace(updatedProject);
  return toProject(updatedProject);
}

export async function deleteProject(projectId: string) {
  await ensureProjectsBootstrapped();
  const deleted = await projectsRepository.deleteById(projectId);

  if (!deleted) {
    throw new Error(`Project '${projectId}' was not found.`);
  }

  return {
    deleted: true,
    projectId,
  };
}

export async function assignProjectConfigurations(input: AssignProjectConfigurationsInput) {
  const project = await getProjectRecordOrThrow(input.projectId);

  const updatedProject: MigrationProjectRecord = {
    ...project,
    sourceConfigurationId: input.sourceConfigurationId,
    destinationConfigurationId: input.destinationConfigurationId,
    updatedAt: new Date().toISOString(),
    updatedBy: SYSTEM_ACTOR,
  };

  await projectsRepository.replace(updatedProject);
  return toProject(updatedProject);
}

export async function isConfigurationInUse(configurationId: string) {
  await ensureProjectsBootstrapped();
  const projects = await projectsRepository.findAll();
  return projects.some(
    (project) =>
      project.sourceConfigurationId === configurationId ||
      project.destinationConfigurationId === configurationId,
  );
}

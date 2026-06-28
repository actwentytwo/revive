import type { SourceVideoPage } from "@revolution/shared";
import { listConfigurations } from "../configurations/configurations.service.js";
import { getProjectRecordById } from "../projects/projects.service.js";
import { RevService } from "../rev-service.js";
import type { ListSourceVideosInput } from "./videos.schemas.js";

const revService = new RevService();

export async function listSourceVideos(input: ListSourceVideosInput): Promise<SourceVideoPage> {
  const project = await getProjectRecordById(input.projectId);
  const configurations = await listConfigurations();
  const sourceConfiguration = configurations.find(
    (configuration) => configuration.id === project.sourceConfigurationId,
  );

  const sourceEnvironment = sourceConfiguration?.environment ?? project.sourceEnvironment ?? null;

  if (!sourceEnvironment) {
    throw new Error("This project does not have a saved source configuration yet.");
  }

  return revService.listVideos({
    environment: sourceEnvironment,
    search: input.search,
    page: input.page,
    pageSize: input.pageSize,
  });
}

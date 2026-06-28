import type {
  ProjectType,
  RevAuthType,
  RevEnvironmentInput,
  SavedConfiguration,
} from "@revolution/shared";

export type ConfigurationFormState = {
  name: string;
  productVersion: string;
  authType: RevAuthType;
  url: string;
  apiKey: string;
  secret: string;
  username: string;
  password: string;
};

const DEFAULT_VBRICK_VERSIONS = ["v6.0", "v7.3", "v8.1", "v8.6"];

export function normalizeVbrickVersion(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return /^v/i.test(trimmed) ? `v${trimmed.slice(1)}` : `v${trimmed}`;
}

export function getAvailableVbrickVersions(): string[] {
  const configuredRaw = import.meta.env.VITE_VBRICK_VERSIONS as string | undefined;
  const configured: string[] = configuredRaw
    ? configuredRaw
        .split(",")
        .map((value: string) => normalizeVbrickVersion(value))
        .filter((value: string) => value.length > 0)
    : [];

  const versions = configured.length > 0 ? configured : DEFAULT_VBRICK_VERSIONS;
  return Array.from(new Set<string>(versions));
}

export function compareVersionsDescending(left: string, right: string) {
  return right.localeCompare(left, undefined, { numeric: true, sensitivity: "base" });
}

export function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatProjectType(projectType: ProjectType) {
  switch (projectType) {
    case "migration":
      return "Migration";
    default:
      return projectType;
  }
}

export function formatConfigurationLabel(configuration: SavedConfiguration) {
  return configuration.productVersion
    ? `${configuration.name} (${normalizeVbrickVersion(configuration.productVersion)})`
    : configuration.name;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export function emptyConfigurationFormState(): ConfigurationFormState {
  return {
    name: "",
    productVersion: "",
    authType: "apiKey",
    url: "",
    apiKey: "",
    secret: "",
    username: "",
    password: "",
  };
}

export function formStateFromConfiguration(
  configuration?: SavedConfiguration,
): ConfigurationFormState {
  if (!configuration) {
    return emptyConfigurationFormState();
  }

  if (configuration.environment.authType === "apiKey") {
    return {
      name: configuration.name,
      productVersion: normalizeVbrickVersion(configuration.productVersion),
      authType: "apiKey",
      url: configuration.environment.url,
      apiKey: configuration.environment.apiKey,
      secret: configuration.environment.secret,
      username: "",
      password: "",
    };
  }

  return {
    name: configuration.name,
    productVersion: normalizeVbrickVersion(configuration.productVersion),
    authType: "userPassword",
    url: configuration.environment.url,
    apiKey: "",
    secret: "",
    username: configuration.environment.username,
    password: configuration.environment.password,
  };
}

export function configurationFormToEnvironment(
  formState: ConfigurationFormState,
): RevEnvironmentInput {
  if (formState.authType === "apiKey") {
    return {
      url: formState.url,
      authType: "apiKey",
      apiKey: formState.apiKey,
      secret: formState.secret,
    };
  }

  return {
    url: formState.url,
    authType: "userPassword",
    username: formState.username,
    password: formState.password,
  };
}

export function isConfigurationFormReady(formState: ConfigurationFormState) {
  if (!formState.name.trim() || !formState.url.trim()) {
    return false;
  }

  if (formState.authType === "apiKey") {
    return Boolean(formState.apiKey.trim() && formState.secret.trim());
  }

  return Boolean(formState.username.trim() && formState.password.trim());
}

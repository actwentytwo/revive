#!/usr/bin/env node

import process from "node:process";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { dirname, resolve } from "node:path";

import dotenvFlow from "dotenv-flow";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..", "..");

const [mode, appPathArg, ...restArgs] = process.argv.slice(2);

if (!["--get", "--get-from-file"].includes(mode ?? "") || !appPathArg) {
  console.error("Usage: node scripts/lib/resolve-env.mjs --get <app-path> <ENV_KEY>");
  console.error(
    "   or: node scripts/lib/resolve-env.mjs --get-from-file <app-path> <file-name> <ENV_KEY>",
  );
  process.exit(1);
}

const appDir = resolve(repoRoot, appPathArg);

if (mode === "--get") {
  const [key] = restArgs;

  if (!key) {
    console.error("Usage: node scripts/lib/resolve-env.mjs --get <app-path> <ENV_KEY>");
    process.exit(1);
  }

  dotenvFlow.config({
    path: appDir,
    default_node_env: "development",
    ...(process.env.NODE_ENV === "test" ? { node_env: "development" } : {}),
    silent: true,
  });

  process.stdout.write(process.env[key] ?? "");
  process.exit(0);
}

const [fileName, key] = restArgs;

if (!fileName || !key) {
  console.error(
    "Usage: node scripts/lib/resolve-env.mjs --get-from-file <app-path> <file-name> <ENV_KEY>",
  );
  process.exit(1);
}

const envFilePath = resolve(appDir, fileName);

if (!fs.existsSync(envFilePath)) {
  process.stdout.write("");
  process.exit(0);
}

const lines = fs.readFileSync(envFilePath, "utf8").split(/\r?\n/);

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    continue;
  }

  const equalsIndex = trimmed.indexOf("=");
  if (equalsIndex < 0) {
    continue;
  }

  const candidateKey = trimmed.slice(0, equalsIndex).trim();
  if (candidateKey !== key) {
    continue;
  }

  let value = trimmed.slice(equalsIndex + 1);
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  process.stdout.write(value);
  process.exit(0);
}

process.stdout.write("");

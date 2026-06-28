import fs from "node:fs/promises";
import path from "node:path";

const workspaceRoots = ["apps", "packages"];
const rootPackagePath = path.resolve("package.json");

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function collectWorkspacePackageFiles() {
  const packageFiles = [];

  for (const root of workspaceRoots) {
    const rootPath = path.resolve(root);
    let entries = [];

    try {
      entries = await fs.readdir(rootPath, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const packageJsonPath = path.join(rootPath, entry.name, "package.json");
      try {
        await fs.access(packageJsonPath);
        packageFiles.push(packageJsonPath);
      } catch {
        // Skip directories that are not packages.
      }
    }
  }

  return packageFiles;
}

async function main() {
  const rootPackage = await readJson(rootPackagePath);
  const expectedVersion = rootPackage.version;

  if (!expectedVersion) {
    console.error("Root package version is missing.");
    process.exit(1);
  }

  const workspacePackageFiles = await collectWorkspacePackageFiles();
  const mismatches = [];

  for (const packageFile of workspacePackageFiles) {
    const pkg = await readJson(packageFile);
    if (pkg.version !== expectedVersion) {
      mismatches.push({
        file: path.relative(process.cwd(), packageFile),
        name: pkg.name ?? "(unnamed package)",
        version: pkg.version ?? "(missing)",
      });
    }
  }

  if (mismatches.length > 0) {
    console.error(
      `Version mismatch: expected all workspace packages to be ${expectedVersion} (root package.json).`,
    );
    for (const mismatch of mismatches) {
      console.error(`- ${mismatch.name} in ${mismatch.file}: ${mismatch.version}`);
    }
    process.exit(1);
  }

  console.log(
    `Version check passed. ${workspacePackageFiles.length} workspace package(s) aligned at ${expectedVersion}.`,
  );
}

await main();

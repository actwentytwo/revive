import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const sharedPackagePath = path.join(rootDir, "packages/shared/package.json");
const sharedSrcDir = path.join(rootDir, "packages/shared/src");

const importRegex = /\bimport\s+(?:type\s+)?[\s\S]*?\sfrom\s+["']([^"']+)["']/g;

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function hasRuntimeDeps(pkg) {
  return ["dependencies", "peerDependencies", "optionalDependencies"].some((field) => {
    const value = pkg[field];
    return value && Object.keys(value).length > 0;
  });
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(absolute)));
      continue;
    }

    if (entry.isFile() && /\.(ts|tsx|js|mjs|cjs)$/.test(entry.name)) {
      files.push(absolute);
    }
  }

  return files;
}

function normalizePath(value) {
  return value.replaceAll("\\", "/");
}

function validateImportSpecifier(specifier, filePath) {
  const normalizedSpecifier = normalizePath(specifier);

  if (normalizedSpecifier.startsWith("node:")) {
    return null;
  }

  if (normalizedSpecifier.startsWith(".")) {
    const resolved = normalizePath(path.resolve(path.dirname(filePath), normalizedSpecifier));
    const sharedRoot = normalizePath(path.resolve(path.join(rootDir, "packages/shared")));
    if (!resolved.startsWith(sharedRoot)) {
      return `relative import escapes shared package boundary: '${specifier}'`;
    }

    return null;
  }

  return `external dependency import is not allowed in shared contracts: '${specifier}'`;
}

async function validateSharedSourceImports() {
  const files = await listFiles(sharedSrcDir);
  const violations = [];

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    for (const match of content.matchAll(importRegex)) {
      const specifier = match[1];
      const violation = validateImportSpecifier(specifier, file);
      if (violation) {
        violations.push({
          file: path.relative(rootDir, file),
          reason: violation,
        });
      }
    }
  }

  return violations;
}

async function main() {
  const sharedPackage = await readJson(sharedPackagePath);
  const errors = [];

  if (hasRuntimeDeps(sharedPackage)) {
    errors.push(
      "packages/shared/package.json must not declare dependencies, peerDependencies, or optionalDependencies.",
    );
  }

  const importViolations = await validateSharedSourceImports();
  for (const violation of importViolations) {
    errors.push(`${violation.file}: ${violation.reason}`);
  }

  if (errors.length > 0) {
    console.error("Shared package boundary check failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(
    "Shared package boundary check passed: @revolution/shared remains framework-agnostic and dependency-free.",
  );
}

await main();

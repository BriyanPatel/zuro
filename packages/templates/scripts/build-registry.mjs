import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const cwd = process.cwd();
const packageJsonPath = path.join(cwd, "package.json");
const templateManifestPath = path.join(cwd, "registry", "index.json");
const sourceExpressDir = path.join(cwd, "express");
const distRoot = path.join(cwd, "dist", "registry");

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function withTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

async function main() {
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  const templateVersion = packageJson.version;

  if (!templateVersion) {
    throw new Error("templates package version is required");
  }

  const versionDirName = `v${templateVersion}`;
  const versionRoot = path.join(distRoot, versionDirName);
  const generatedAt = new Date().toISOString();

  await rm(distRoot, { recursive: true, force: true });

  await cp(sourceExpressDir, path.join(versionRoot, "express"), {
    recursive: true,
    filter: (sourcePath) => !sourcePath.includes(".tmp."),
  });

  const manifestTemplate = JSON.parse(await readFile(templateManifestPath, "utf8"));

  for (const moduleData of Object.values(manifestTemplate.modules ?? {})) {
    const files = Array.isArray(moduleData.files) ? moduleData.files : [];

    for (const file of files) {
      const filePath = path.join(versionRoot, file.path);
      const fileBuffer = await readFile(filePath);

      file.size = fileBuffer.byteLength;
      file.sha256 = sha256(fileBuffer);
    }
  }

  const manifest = {
    schemaVersion: 1,
    templateVersion,
    generatedAt,
    ...manifestTemplate,
  };

  await writeFile(path.join(versionRoot, "index.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  const stablePointer = {
    schemaVersion: 1,
    channel: "stable",
    templateVersion,
    generatedAt,
    indexPath: `/${versionDirName}/index.json`,
  };

  await mkdir(path.join(distRoot, "channels"), { recursive: true });
  await writeFile(
    path.join(distRoot, "channels", "stable.json"),
    `${JSON.stringify(stablePointer, null, 2)}\n`
  );

  await writeFile(path.join(distRoot, "index.json"), `${JSON.stringify(stablePointer, null, 2)}\n`);

  const localHint = withTrailingSlash(path.join("dist", "registry"));
  console.log(`Built registry ${versionDirName} at ${localHint}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

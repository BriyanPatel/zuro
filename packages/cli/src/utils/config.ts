import fs from "fs-extra";
import path from "path";

export interface ZuroConfig {
  name?: string;
  pm?: string;
  srcDir?: string;
}

function sanitizeConfig(input: unknown): ZuroConfig {
  if (!input || typeof input !== "object") {
    return {};
  }

  const raw = input as Record<string, unknown>;
  const config: ZuroConfig = {};

  if (typeof raw.name === "string") {
    config.name = raw.name;
  }

  if (typeof raw.pm === "string") {
    config.pm = raw.pm;
  }

  if (typeof raw.srcDir === "string") {
    config.srcDir = raw.srcDir;
  }

  return config;
}

export function getConfigPath(cwd: string) {
  return path.join(cwd, "zuro.json");
}

export async function readZuroConfig(cwd: string): Promise<ZuroConfig | null> {
  const configPath = getConfigPath(cwd);

  if (!(await fs.pathExists(configPath))) {
    return null;
  }

  const raw = await fs.readJson(configPath);
  return sanitizeConfig(raw);
}

export async function writeZuroConfig(cwd: string, config: ZuroConfig) {
  const configPath = getConfigPath(cwd);
  await fs.writeJson(configPath, sanitizeConfig(config), { spaces: 2 });
}

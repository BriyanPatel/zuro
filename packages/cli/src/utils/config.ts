import fs from "fs-extra";
import path from "path";

export interface ZuroConfig {
  name?: string;
  pm?: string;
  srcDir?: string;
  database?: {
    orm?: "drizzle" | "prisma";
    dialect?: "postgresql" | "mysql";
  };
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

  if (raw.database && typeof raw.database === "object") {
    const dbRaw = raw.database as Record<string, unknown>;
    const database: NonNullable<ZuroConfig["database"]> = {};

    if (dbRaw.orm === "drizzle" || dbRaw.orm === "prisma") {
      database.orm = dbRaw.orm;
    }

    if (dbRaw.dialect === "postgresql" || dbRaw.dialect === "mysql") {
      database.dialect = dbRaw.dialect;
    }

    if (database.orm || database.dialect) {
      config.database = database;
    }
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

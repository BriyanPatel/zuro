import { createHash } from "node:crypto";

const DEFAULT_REGISTRY_BASE_URL = "https://registry.zuro.dev";
const DEFAULT_REGISTRY_ENTRY_URL = `${DEFAULT_REGISTRY_BASE_URL}/channels/stable.json`;
const REGISTRY_ENV_VAR = "ZURO_REGISTRY_URL";
const REQUEST_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

export interface RegistryFile {
  path: string;
  target: string;
  type: string;
  sha256?: string;
  size?: number;
}

export interface RegistryModule {
  type: string;
  files: RegistryFile[];
  moduleDependencies?: string[];
  dependencies?: string[];
  devDependencies?: string[];
}

export interface RegistryManifest {
  schemaVersion?: number;
  status?: string;
  templateVersion?: string;
  generatedAt?: string;
  modules: Record<string, RegistryModule>;
}

interface RegistryChannelPointer {
  schemaVersion?: number;
  channel?: string;
  templateVersion?: string;
  generatedAt?: string;
  indexPath?: string;
  indexUrl?: string;
}

export interface RegistryContext {
  manifest: RegistryManifest;
  manifestUrl: string;
  fileBaseUrl: string;
}

interface FetchFileOptions {
  baseUrl: string;
  expectedSha256?: string;
  expectedSize?: number;
}

export function getRegistryUrl() {
  return resolveRegistryEntryUrl();
}

function withTrailingSlash(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}

function resolveRegistryEntryUrl() {
  const override = process.env[REGISTRY_ENV_VAR]?.trim();

  if (!override) {
    return DEFAULT_REGISTRY_ENTRY_URL;
  }

  let parsed: URL;

  try {
    parsed = new URL(override);
  } catch {
    throw new Error(
      `Invalid ${REGISTRY_ENV_VAR} value '${override}'. Expected a valid http(s) URL.`
    );
  }

  if (parsed.pathname.endsWith(".json")) {
    return parsed.toString();
  }

  return new URL("channels/stable.json", withTrailingSlash(parsed.toString())).toString();
}

function isRegistryManifest(data: unknown): data is RegistryManifest {
  if (!data || typeof data !== "object") {
    return false;
  }

  const candidate = data as Partial<RegistryManifest>;
  return !!candidate.modules && typeof candidate.modules === "object";
}

function isChannelPointer(data: unknown): data is RegistryChannelPointer {
  if (!data || typeof data !== "object") {
    return false;
  }

  const candidate = data as Partial<RegistryChannelPointer>;
  return typeof candidate.indexPath === "string" || typeof candidate.indexUrl === "string";
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json, text/plain, */*" },
        signal: controller.signal,
      });

      if (response.ok) {
        return response;
      }

      const shouldRetry = response.status >= 500 && attempt < MAX_RETRIES;
      if (shouldRetry) {
        await delay(250 * (attempt + 1));
        continue;
      }

      throw new Error(`Request failed (${response.status} ${response.statusText}) for ${url}`);
    } catch (error) {
      lastError = error;

      if (attempt === MAX_RETRIES) {
        break;
      }

      await delay(250 * (attempt + 1));
    } finally {
      clearTimeout(timeout);
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error(`Failed to fetch ${url}`);
}

async function fetchJson<T>(url: string): Promise<{ data: T; resolvedUrl: string }> {
  const response = await fetchWithRetry(url);
  const data = (await response.json()) as T;

  return {
    data,
    resolvedUrl: response.url || url,
  };
}

function resolveManifestUrl(pointer: RegistryChannelPointer, pointerUrl: string): string {
  const explicit = pointer.indexUrl || pointer.indexPath;

  if (!explicit) {
    throw new Error("Registry channel pointer is missing indexUrl/indexPath");
  }

  return new URL(explicit, pointerUrl).toString();
}

export async function fetchRegistry(): Promise<RegistryContext> {
  const registryEntryUrl = resolveRegistryEntryUrl();
  let entry: { data: unknown; resolvedUrl: string };

  try {
    entry = await fetchJson<unknown>(registryEntryUrl);
  } catch (error) {
    throw new Error(
      `Unable to fetch registry from ${registryEntryUrl}. For local testing set ${REGISTRY_ENV_VAR}=http://127.0.0.1:8787.`,
      { cause: error as Error }
    );
  }

  if (isRegistryManifest(entry.data)) {
    return {
      manifest: entry.data,
      manifestUrl: entry.resolvedUrl,
      fileBaseUrl: withTrailingSlash(new URL(".", entry.resolvedUrl).toString()),
    };
  }

  if (!isChannelPointer(entry.data)) {
    throw new Error(
      `Invalid registry payload at ${registryEntryUrl}. Expected manifest or channel pointer.`
    );
  }

  const manifestUrl = resolveManifestUrl(entry.data, entry.resolvedUrl);
  const manifestResult = await fetchJson<unknown>(manifestUrl);

  if (!isRegistryManifest(manifestResult.data)) {
    throw new Error(`Invalid manifest payload at ${manifestUrl}.`);
  }

  return {
    manifest: manifestResult.data,
    manifestUrl: manifestResult.resolvedUrl,
    fileBaseUrl: withTrailingSlash(new URL(".", manifestResult.resolvedUrl).toString()),
  };
}

export async function fetchFile(filePath: string, options: FetchFileOptions) {
  const normalizedPath = filePath.replace(/^\//, "");
  const fileUrl = new URL(normalizedPath, withTrailingSlash(options.baseUrl)).toString();
  const response = await fetchWithRetry(fileUrl);
  const content = await response.text();

  if (typeof options.expectedSize === "number") {
    const actualSize = Buffer.byteLength(content, "utf8");
    if (actualSize !== options.expectedSize) {
      throw new Error(
        `Size mismatch for ${filePath}. Expected ${options.expectedSize}, got ${actualSize}.`
      );
    }
  }

  if (options.expectedSha256) {
    const actualSha256 = createHash("sha256").update(content, "utf8").digest("hex");
    if (actualSha256 !== options.expectedSha256) {
      throw new Error(
        `Checksum mismatch for ${filePath}. Expected ${options.expectedSha256}, got ${actualSha256}.`
      );
    }
  }

  return content;
}

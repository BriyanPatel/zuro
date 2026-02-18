// Registry URL - uses env variable or falls back to production
const DEFAULT_REGISTRY_URL = "http://localhost:3000/registry";
const REGISTRY_URL = process.env.ZURO_REGISTRY_URL || DEFAULT_REGISTRY_URL;

export function getRegistryUrl() {
    return REGISTRY_URL;
}

export async function fetchRegistry() {
    const res = await fetch(`${REGISTRY_URL}/index.json`);
    if (!res.ok) {
        throw new Error(`Failed to fetch registry: ${res.statusText}`);
    }
    return res.json();
}

export async function fetchFile(path: string) {
    const res = await fetch(`${REGISTRY_URL}/${path}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch file ${path}: ${res.statusText}`);
    }
    return res.text();
}

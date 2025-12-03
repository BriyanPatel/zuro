const REGISTRY_URL = "http://localhost:3000/registry";

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

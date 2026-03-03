/**
 * Escapes special regex characters in a string so it can be used
 * as a literal pattern inside a RegExp.
 */
export function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Inserts an import statement after the last existing import in the source.
 * Returns `{ source, inserted }` — `inserted` is false only when no
 * existing imports could be found (malformed file).
 *
 * If the import already exists, returns the original source with `inserted: true`.
 */
export function appendImport(source: string, line: string) {
    if (source.includes(line)) {
        return { source, inserted: true };
    }

    const importRegex = /^import .+ from .+;?\s*$/gm;
    let lastImportIndex = 0;
    let match;

    while ((match = importRegex.exec(source)) !== null) {
        lastImportIndex = match.index + match[0].length;
    }

    if (lastImportIndex <= 0) {
        return { source, inserted: false };
    }

    return {
        source: source.slice(0, lastImportIndex) + `\n${line}` + source.slice(lastImportIndex),
        inserted: true,
    };
}

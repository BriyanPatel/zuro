import path from "path";
import type { RegistryFile } from "./registry";

/**
 * Resolves the absolute target path for a registry file and ensures
 * it does not escape the project root (path-traversal guard).
 */
export function resolveSafeTargetPath(projectRoot: string, srcDir: string, file: RegistryFile) {
    const targetPath = path.resolve(projectRoot, srcDir, file.target);
    const normalizedRoot = path.resolve(projectRoot);

    if (targetPath !== normalizedRoot && !targetPath.startsWith(`${normalizedRoot}${path.sep}`)) {
        throw new Error(`Refusing to write outside project directory: ${file.target}`);
    }

    return targetPath;
}

import { createServer } from "node:http";
import { stat, readFile } from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const rootDir = path.resolve(cwd, "dist", "registry");
const port = Number(process.env.REGISTRY_PORT || 8787);

function getContentType(filePath) {
  if (filePath.endsWith(".json")) {
    return "application/json; charset=utf-8";
  }

  if (filePath.endsWith(".ts")) {
    return "text/plain; charset=utf-8";
  }

  return "application/octet-stream";
}

function resolveRequestFile(requestPathname) {
  const normalizedPathname = requestPathname === "/" ? "/index.json" : requestPathname;
  const resolvedPath = path.resolve(rootDir, `.${normalizedPathname}`);

  if (resolvedPath !== rootDir && !resolvedPath.startsWith(`${rootDir}${path.sep}`)) {
    return null;
  }

  return resolvedPath;
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await fileExists(rootDir))) {
    console.error(
      `Registry artifacts not found at ${rootDir}. Run "corepack pnpm --filter @zuro/templates build:registry" first.`
    );
    process.exit(1);
  }

  const server = createServer(async (req, res) => {
    if (!req.url || !req.method) {
      res.statusCode = 400;
      res.end("Bad Request");
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }

    const pathname = new URL(req.url, "http://localhost").pathname;
    const requestFile = resolveRequestFile(pathname);

    if (!requestFile) {
      res.statusCode = 403;
      res.end("Forbidden");
      return;
    }

    try {
      let filePath = requestFile;
      const fileStat = await stat(filePath);

      if (fileStat.isDirectory()) {
        filePath = path.join(filePath, "index.json");
      }

      const content = await readFile(filePath);
      res.setHeader("Content-Type", getContentType(filePath));
      res.setHeader("Cache-Control", "no-store");
      res.statusCode = 200;

      if (req.method === "HEAD") {
        res.end();
        return;
      }

      res.end(content);
    } catch {
      res.statusCode = 404;
      res.end("Not Found");
    }
  });

  server.listen(port, () => {
    console.log(`Local registry running at http://127.0.0.1:${port}`);
    console.log(`Serving files from ${rootDir}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

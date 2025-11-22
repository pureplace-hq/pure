import http from "http";
import fs from "fs";
import path from "path";
import { build } from "./build.js";
import { BuildOptions } from "./types.js";

interface ServeOptions extends BuildOptions {
  port?: string;
}

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".xml": "application/xml",
  ".txt": "text/plain",
};

export async function serve(options: ServeOptions): Promise<void> {
  const outputDir = options.output || "public";
  const port = parseInt(options.port || "3000", 10);

  // Build first
  console.log("Building site...");
  await build(options);
  console.log("");

  // Start server
  const server = http.createServer((req, res) => {
    let urlPath = req.url || "/";

    // Remove query string
    urlPath = urlPath.split("?")[0];

    // Decode URI components
    urlPath = decodeURIComponent(urlPath);

    // Default to index.html for directory requests
    if (urlPath.endsWith("/")) {
      urlPath += "index.html";
    }

    const filePath = path.join(outputDir, urlPath);

    // Security: prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    const resolvedOutputDir = path.resolve(outputDir);
    if (!resolvedPath.startsWith(resolvedOutputDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          console.log(`404 ${urlPath}`);
          res.writeHead(404);
          res.end("Not Found");
        } else {
          console.log(`500 ${urlPath} - ${err.message}`);
          res.writeHead(500);
          res.end("Internal Server Error");
        }
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      console.log(`200 ${urlPath}`);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
  });

  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log("Press Ctrl+C to stop");
  });
}

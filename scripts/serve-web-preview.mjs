import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(process.argv[2] ?? fileURLToPath(new URL("../dist/web", import.meta.url)));
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ttf": "font/ttf", ".txt": "text/plain; charset=utf-8" };

createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405); response.end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
  catch { response.writeHead(400); response.end(); return; }
  const filename = path.resolve(root, "." + (pathname.endsWith("/") ? pathname + "index.html" : pathname));
  if (!filename.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
  try {
    const info = await stat(filename);
    if (!info.isFile()) throw new Error("not a file");
    const data = request.method === "HEAD" ? null : await readFile(filename);
    response.writeHead(200, { "Content-Type": mime[path.extname(filename)] ?? "application/octet-stream", "Content-Length": info.size, "Cache-Control": "no-cache" });
    response.end(data);
  } catch { response.writeHead(404); response.end("Not found"); }
}).listen(4191, "127.0.0.1", () => console.log("Worry Laundry preview http://localhost:4191/"));

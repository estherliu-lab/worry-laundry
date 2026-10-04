import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, openSync, closeSync, writeFileSync, cpSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const url = "http://127.0.0.1:4191/";
// Use a disposable build copy without changing macOS privacy settings.
const sessionDirectory = process.platform === "darwin" ? path.join("/private/tmp", `codex-worry-laundry-preview-${process.getuid()}`) : path.join(root, ".preview");
mkdirSync(sessionDirectory, { recursive: true });
cpSync(path.join(root, "dist/web"), path.join(sessionDirectory, "web"), { recursive: true });
copyFileSync(path.join(root, "scripts/serve-web-preview.mjs"), path.join(sessionDirectory, "serve-web-preview.mjs"));
async function ready() {
  try { const response = await fetch(url, { signal: AbortSignal.timeout(1500) }); return response.ok && (await response.text()).includes("Worry Laundry"); } catch { return false; }
}
if (await ready()) {
  console.log("Web preview already running at http://localhost:4191/");
} else {
  const directory = path.join(root, ".preview");
  mkdirSync(directory, { recursive: true });
  const entry = path.join(sessionDirectory, "serve-web-preview.mjs");
  const servedRoot = path.join(sessionDirectory, "web");
  let supervisor = "detached";
  let pid;
  const label = "org.codex.worry-laundry.preview";
  if (process.platform === "darwin") {
    // A session-scoped launchd job survives terminal and tool-process cleanup.
    // No login item or launch-agent file is installed.
    const listed = spawnSync("/bin/launchctl", ["list", label], { encoding: "utf8" });
    const launched = listed.status === 0
      ? spawnSync("/bin/launchctl", ["start", label], { encoding: "utf8" })
      : spawnSync("/bin/launchctl", ["submit", "-l", label, "-o", path.join(sessionDirectory, "web.log"), "-e", path.join(sessionDirectory, "web-error.log"), "--", process.execPath, entry, servedRoot], { encoding: "utf8" });
    if (launched.status !== 0) throw new Error(`Could not start system-managed preview: ${launched.stderr?.trim() || launched.error?.message || "launchctl failed"}`);
    supervisor = "launchd";
  } else {
    const log = openSync(path.join(directory, "web.log"), "a");
    const child = spawn(process.execPath, [entry, servedRoot], { cwd: root, detached: true, stdio: ["ignore", log, log] });
    child.unref(); closeSync(log); pid = child.pid;
  }
  writeFileSync(path.join(directory, "web-server.json"), JSON.stringify({ supervisor, label: supervisor === "launchd" ? label : undefined, pid, url, servedRoot, logDirectory: sessionDirectory, startedAt: new Date().toISOString() }, null, 2));
  let started = false;
  for (let attempt = 0; attempt < 20; attempt++) {
    if (await ready()) { started = true; break; }
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  if (!started) throw new Error("Web preview did not start check .preview/web.log");
  console.log("Web preview restored at http://localhost:4191/");
}

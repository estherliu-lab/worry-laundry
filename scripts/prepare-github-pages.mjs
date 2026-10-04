import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const built = spawnSync(process.execPath, [path.join(root, "node_modules/vite/bin/vite.js"), "build", "--config", "vite.web.config.ts", "--base", "/worry-laundry/", "--outDir", "../docs"], { cwd: root, stdio: "inherit" });
if (built.status !== 0) process.exit(built.status ?? 1);
writeFileSync(path.join(root, "docs/.nojekyll"), "");
console.log("GitHub Pages output prepared in docs/");

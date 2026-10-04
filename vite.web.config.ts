import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
export default defineConfig({
  root: "web",
  publicDir: "../public",
  plugins: [react()],
  build: { outDir: "../dist/web", emptyOutDir: true, rollupOptions: { input: { game: fileURLToPath(new URL("./web/index.html", import.meta.url)), about: fileURLToPath(new URL("./web/about/index.html", import.meta.url)) } } },
  server: { host: "127.0.0.1", port: 4190, strictPort: true },
});

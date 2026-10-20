import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./webapp/src", import.meta.url)),
    },
  },
  server: {
    middlewareMode: true,
  },
  build: {
    outDir: "../dist/client",
    emptyOutDir: true,
  },
  root: "webapp",
});

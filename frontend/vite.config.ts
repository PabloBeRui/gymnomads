/// <reference types="vitest" />
import { defineConfig } from "vite";
import type { UserConfig } from "vite";
import type { InlineConfig } from "vitest/node";
import react from "@vitejs/plugin-react-swc";
import path from "path";

interface VitestConfigExport extends UserConfig {
  test: InlineConfig;
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
    css: true,
  },
  server: {
    host: true, // This makes Vite listen on all local IPs, enabling mobile access
    port: 5173, // Ensure the port is 5173
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true, // Suprimir warnings de dependencias como Bootstrap
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
} as VitestConfigExport);

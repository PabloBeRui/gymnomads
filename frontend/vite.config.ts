import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true, // Suprimir warnings de dependencias como Bootstrap
      },
    },
  },
});

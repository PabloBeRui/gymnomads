import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
});

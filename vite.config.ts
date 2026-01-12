import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorModal from "@replit/vite-plugin-runtime-error-modal";
import { devBanner } from "@replit/vite-plugin-dev-banner";
import { cartographer } from "@replit/vite-plugin-cartographer";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorModal(),
    devBanner(),
    cartographer(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "client", "public", "assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist", "public"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "client", "index.html"),
    },
  },
});

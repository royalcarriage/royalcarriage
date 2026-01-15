import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorModal from "@replit/vite-plugin-runtime-error-modal";
import { devBanner } from "@replit/vite-plugin-dev-banner";
import { cartographer } from "@replit/vite-plugin-cartographer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [
      react(),
      ...(isDev ? [runtimeErrorModal(), devBanner(), cartographer()] : []),
    ],
    css: {
      postcss: {
        from: path.resolve(__dirname, "client", "src", "index.css"),
      },
    },
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
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "wouter"],
            "query-vendor": ["@tanstack/react-query"],
            "ui-vendor": ["lucide-react"],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  };
});

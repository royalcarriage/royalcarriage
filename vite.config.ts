import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorModal from "@replit/vite-plugin-runtime-error-modal";
import { devBanner } from "@replit/vite-plugin-dev-banner";
import { cartographer } from "@replit/vite-plugin-cartographer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  plugins: [
    react(),
    ...(isDev ? [runtimeErrorModal(), devBanner(), cartographer()] : []),
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
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
          // Split React and related libraries into a separate chunk
          'react-vendor': ['react', 'react-dom', 'wouter'],
          // Split React Query into its own chunk
          'query-vendor': ['@tanstack/react-query'],
          // Split UI libraries
          'ui-vendor': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});

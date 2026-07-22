import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// @ts-expect-error - JS module without types
import { generateIndex } from "./scripts/generate-eadplataforma-index.mjs";

// Vite plugin: regenerates the eadplataforma index on server start and before build
function eadplataformaIndexPlugin() {
  return {
    name: "eadplataforma-index",
    buildStart() {
      try {
        generateIndex();
      } catch (e) {
        console.warn("[eadplataforma-index] failed:", e);
      }
    },
    configureServer() {
      try {
        generateIndex();
      } catch (e) {
        console.warn("[eadplataforma-index] failed:", e);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    eadplataformaIndexPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          ui: [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@tanstack/react-query",
          ],
          certificates: ["jspdf", "html2canvas", "qrcode", "file-saver"],
        },
      },
    },
  },
}));

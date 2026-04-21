import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
// @ts-ignore - JS module without types
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
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    eadplataformaIndexPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

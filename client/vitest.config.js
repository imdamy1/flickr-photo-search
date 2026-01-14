// Configurație Vitest pentru testarea aplicației React
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()], // suport React
  test: {
    environment: "jsdom",        // DOM virtual pentru teste
    globals: true,               // permite describe/it fără import
    setupFiles: "./src/testSetup.js", // setup global pentru teste
  },
});

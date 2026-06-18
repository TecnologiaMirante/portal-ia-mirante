/* global __dirname */
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  appType: "spa", // serve index.html for all routes (React Router support)
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@infra/firebase": path.resolve(__dirname, "./firebaseClient"),
    },
  },
});

// Plugins
import vue from "@vitejs/plugin-vue";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// Utilities
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

import Terminal from "vite-plugin-terminal";

export default defineConfig({
  build: {
    sourcemap: true,
  },

  plugins: [
    Terminal(),
    vue({
      template: { transformAssetUrls },
    }),
    vuetify({
      autoImport: true,
    }),
  ],
  define: { "process.env": {} },

  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
      {
        find: "common",
        replacement: fileURLToPath(
          new URL("../math-common/src", import.meta.url),
        ),
      },
    ],
  },

  server: {
    host: "0.0.0.0",
    cors: true,
    port: Number(process.env.WEB_PORT) || 3000,
    proxy: {
      "/api": {
        target: "http://localhost:" + process.env.API_PORT || "8081",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://localhost:" + process.env.MESSAGING_PORT || "3030",
        changeOrigin: true,
        ws: true,
        secure: false,
      },
    },
  },
});

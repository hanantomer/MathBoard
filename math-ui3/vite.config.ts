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
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://localhost:3030",
        changeOrigin: true,
        ws: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on("error", function (err, _req, _res) {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", function (proxyReq, req, _res) {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", function (proxyRes, req, _res) {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url,
            );
          });
        },
      },
    },
  },

  
});

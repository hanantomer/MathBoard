// Plugins
import vue from "@vitejs/plugin-vue";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// Utilities
import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from "node:url";

import Terminal from "vite-plugin-terminal";

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return {

    define: {
        _global: ({})
    },

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
      port: Number(process.env.VITE_WEB_PORT /*see .env*/),
      proxy: {
        "/api": {
          target: "http://localhost:" + process.env.VITE_API_PORT /*see .env*/,
          changeOrigin: true,
          secure: false,
        },
        "/socket.io": {
          target:
            "http://localhost:" + process.env.VITE_MESSAGING_PORT /*see .env*/,
          changeOrigin: true,
          ws: true,
          secure: false,
        },
      },
    },
  };
});

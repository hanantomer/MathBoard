// Plugins
import vue from "@vitejs/plugin-vue";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
// Utilities
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
    plugins: [
        vue({
            template: { transformAssetUrls: transformAssetUrls },
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
                replacement: fileURLToPath(new URL("../math-common/src", import.meta.url)),
            },
        ],
    },
    //extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
    server: {
        port: 3000,
        proxy: {
            "/api": {
                target: "http://localhost:8081",
                changeOrigin: true,
                secure: false,
            },
            "/msg": {
                target: "http://localhost:3030",
                changeOrigin: true,
                secure: false,
            },
        },
    },
});

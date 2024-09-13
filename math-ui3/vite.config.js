var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// Plugins
import vue from "@vitejs/plugin-vue";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
// Utilities
import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from "node:url";
import Terminal from "vite-plugin-terminal";
export default defineConfig(function (_a) {
    var mode = _a.mode;
    process.env = __assign(__assign({}, process.env), loadEnv(mode, process.cwd()));
    return {
        build: {
            sourcemap: true,
        },
        plugins: [
            Terminal(),
            vue({
                template: { transformAssetUrls: transformAssetUrls },
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
                    replacement: fileURLToPath(new URL("../math-common/src", import.meta.url)),
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
                    target: "http://localhost:" + process.env.VITE_MESSAGING_PORT /*see .env*/,
                    changeOrigin: true,
                    ws: true,
                    secure: false,
                },
            },
        },
    };
});

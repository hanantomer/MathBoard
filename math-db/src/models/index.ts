import { Sequelize } from "sequelize-typescript";
import fs from "fs";
import path from "path";

/** Load KEY=VALUE lines without requiring dotenv (used by standalone seed scripts). */
function loadEnvFile(filePath: string) {
    if (!fs.existsSync(filePath)) return;
    const text = fs.readFileSync(filePath, "utf8");
    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        const eq = line.indexOf("=");
        if (eq <= 0) continue;
        const key = line.slice(0, eq).trim();
        let value = line.slice(eq + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        if (process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

// Prefer already-set process env; otherwise pull from math-server/.env then math-db/.env.
loadEnvFile(path.resolve(__dirname, "../../../math-server/.env"));
loadEnvFile(path.resolve(__dirname, "../../.env"));

const env: string = process.env.NODE_ENV || "development";
const config = require("../../server/config/config.json")[env];

if (!config) {
    throw new Error(
        `Unknown NODE_ENV="${env}". Use development | test | prod (see math-db/server/config/config.json).`,
    );
}

const urlEnvName = config.url as string;
const url = process.env[urlEnvName];

if (!url || typeof url !== "string") {
    throw new Error(
        `Database URL missing: set ${urlEnvName} in the environment or in math-server/.env (NODE_ENV=${env}).`,
    );
}

const sequelize = new Sequelize(url, {
    ...config,
    // Avoid logging every SQL query in production.
    logging: env === "development" ? console.log : false,
});

sequelize.addModels([__dirname.replace("/\\/g", "/") + "/**/*.model.js"]);

if (env === "development") {
    console.log("db env", env);
    console.log("db config", config);
}

export default { sequelize };

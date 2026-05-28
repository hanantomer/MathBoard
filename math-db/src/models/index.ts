import { Sequelize } from "sequelize-typescript";

const env: string = process.env.NODE_ENV || "development";
const config = require('../../server/config/config.json')[
    env
];

const url = process.env[config.url]!;

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
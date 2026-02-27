import { Sequelize } from "sequelize-typescript";

const env: string = process.env.NODE_ENV || "development";
const config = require('../../server/config/config.json')[
    env
];

const url = process.env[config.url]!;

const sequelize = new Sequelize(url, config);
    //config.url
    //? new Sequelize(config.url, config)
    //: new Sequelize(config.database, config.username, config.password, config);

sequelize.addModels([__dirname.replace("/\\/g", "/") + "/**/*.model.js"]);    

console.log("db env", env);
console.log("db config", config);

export default { sequelize };
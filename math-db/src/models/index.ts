import { Sequelize } from "sequelize-typescript";

const env: string = process.env.NODE_ENV || "development";
const config = require('../../server/config/config.json')[
    env
];

const sequelize = config.url
    ? new Sequelize(config.url, config)
    : new Sequelize(config.database, config.username, config.password, config);

sequelize.addModels([__dirname.replaceAll("\\","/") + "/**/*.model.js"]);    

export default { Sequelize, sequelize };
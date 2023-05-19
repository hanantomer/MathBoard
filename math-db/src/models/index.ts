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
    
    
/*
global.__mathdb = __dirname + "/../math-db";

import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize-typescript";
const basename: string = path.basename(__filename);
const env: string = process.env.NODE_ENV || "development";
const config = require(`${global.__mathdb}/server/config/config.json`)[env];

function customLogger(queryString: string, queryObject: any) {
    console.log(queryString); // outputs a string
    console.log(queryObject.bind); // outputs an array
}

const db = {};

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        { ...config, logging: customLogger }
    );
}

function processDir(dir: string) {
    fs.readdirSync(dir)
        .filter((file) => {
            return (
                file.indexOf(".") !== 0 &&
                file !== basename &&
                file.slice(-3) === ".ts"
            );
        })
        .forEach((file) => {
            const model = require(path.join(dir, file))(
                sequelize,
                Sequelize.DataTypes
            );
            db[model.name] = model;
        });

    // rcursively loop over sub directories
    fs.readdirSync(dir)
        .filter((file) => {
            file = path.resolve(dir, file);
            return fs.statSync(file).isDirectory();
        })
        .forEach((subdir) => {
            processDir(dir.concat("/").concat(subdir));
        });
}

processDir(__dirname);

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
*/
"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require("../../server/config/config.json")[env];
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

function customLogger(queryString, queryObject) {
    console.log(queryString); // outputs a string
    console.log(queryObject.bind); // outputs an array
}

function processDir(dir) {
    fs.readdirSync(dir)
        .filter((file) => {
            return (
                file.indexOf(".") !== 0 &&
                file !== basename &&
                file.slice(-3) === ".js"
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

module.exports = db;

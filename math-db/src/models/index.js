"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_typescript_1 = require("sequelize-typescript");
var env = process.env.NODE_ENV || "development";
var config = require('../../server/config/config.json')[env];
var sequelize = config.url
    ? new sequelize_typescript_1.Sequelize(config.url, config)
    : new sequelize_typescript_1.Sequelize(config.datacdbase, config.username, config.password, config);
sequelize.addModels([__dirname.replace("/\\/g", "/") + "/**/*.model.js"]);
exports.default = { Sequelize: sequelize_typescript_1.Sequelize, sequelize: sequelize };

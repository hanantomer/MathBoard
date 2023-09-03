"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const env = process.env.NODE_ENV || "development";
const config = require('../../server/config/config.json')[env];
const sequelize = config.url
    ? new sequelize_typescript_1.Sequelize(config.url, config)
    : new sequelize_typescript_1.Sequelize(config.database, config.username, config.password, config);
sequelize.addModels([__dirname.replace("/\\/g", "/") + "/**/*.model.js"]);
exports.default = { sequelize };
//# sourceMappingURL=index.js.map